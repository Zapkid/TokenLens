// MCP server for TokenLens. Exposes the analysis engine as Model Context
// Protocol tools over streamable HTTP at /api/mcp, so Claude (claude.ai
// custom connectors, Claude Code, Claude Desktop) can run token and chain
// analysis conversationally. Tools call the same lib/ functions the UI
// uses and share the in-process report cache. Read-only: no tool mutates
// state, and personal data (portfolio, watchlist) lives in the browser's
// localStorage where this server cannot reach it.

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  summarizeComparison,
  summarizeRegime,
  summarizeReportForLlm,
  summarizeScenarios,
} from "@/lib/mcp";
import { getProvider } from "@/lib/providers";
import { generateReport } from "@/lib/report/pipeline";
import { computeRegime } from "@/lib/report/regime";

const assetTypeSchema = z
  .enum(["token", "chain"])
  .describe(
    "token for a CoinGecko coin id (e.g. solana, chainlink); chain for a DeFiLlama chain slug (e.g. Solana, Arbitrum). Use search_assets first when unsure of the id.",
  );

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

function errorResult(e: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          error: e instanceof Error ? e.message : "Request failed",
        }),
      },
    ],
    isError: true,
  };
}

// Report generation fans out to CoinGecko and DeFiLlama on a cache miss.
// Cap concurrent generations so one enthusiastic session cannot burn the
// free-tier API quota; cached reports are unaffected.
const MAX_CONCURRENT_REPORTS = 2;
let activeReports = 0;
const waiters: (() => void)[] = [];

async function withReportSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeReports >= MAX_CONCURRENT_REPORTS) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  activeReports++;
  try {
    return await fn();
  } finally {
    activeReports--;
    waiters.shift()?.();
  }
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "search_assets",
      "Search TokenLens for crypto tokens and blockchains by name or symbol. " +
        "Call this first whenever the user names an asset and you do not " +
        "already know its TokenLens id and type; the id returned here is " +
        "what every other tool expects.",
      { query: z.string().min(1).describe("Asset name or symbol, e.g. sol, arbitrum") },
      async ({ query }) => {
        try {
          const results = await getProvider().search(query);
          return jsonResult({
            results: results.map((r) => ({
              id: r.id,
              type: r.type,
              name: r.name,
              symbol: r.symbol,
              marketCapRank: r.marketCapRank ?? null,
              hint: r.hint,
            })),
          });
        } catch (e) {
          return errorResult(e);
        }
      },
    );

    server.tool(
      "generate_report",
      "Generate a full TokenLens analysis report for one token or chain. " +
        "Call this when the user asks whether an asset is attractive, risky, " +
        "over or undervalued, or how it scores. Returns opportunity and risk " +
        "pillar scores (0-100, null means no usable data), peer-cohort " +
        "metrics with percentiles, risk grade and quadrant, market regime " +
        "context, and a tier-based holding strategy framework. Results are " +
        "cached for 24 hours.",
      {
        type: assetTypeSchema,
        id: z.string().min(1).describe("TokenLens asset id from search_assets"),
      },
      async ({ type, id }) => {
        try {
          const report = await withReportSlot(() => generateReport(type, id));
          return jsonResult(summarizeReportForLlm(report));
        } catch (e) {
          return errorResult(e);
        }
      },
    );

    server.tool(
      "get_scenarios",
      "Get 3, 6, and 12 month price scenario trajectories for a token or " +
        "chain (plus TVL scenarios for chains): bear, base, and bull ranges " +
        "with probabilities and the visible modifiers that shifted them. " +
        "Call this when the user asks where the price could go or about " +
        "upside and downside ranges. Shares the cached report.",
      {
        type: assetTypeSchema,
        id: z.string().min(1).describe("TokenLens asset id from search_assets"),
      },
      async ({ type, id }) => {
        try {
          const report = await withReportSlot(() => generateReport(type, id));
          return jsonResult(summarizeScenarios(report));
        } catch (e) {
          return errorResult(e);
        }
      },
    );

    server.tool(
      "compare_assets",
      "Compare two to four tokens or chains side by side: overall scores, " +
        "risk grades, quadrants, per-pillar breakdowns, and strategy tiers. " +
        "Call this when the user asks which of several assets looks better " +
        "or how they differ.",
      {
        assets: z
          .array(z.object({ type: assetTypeSchema, id: z.string().min(1) }))
          .min(2)
          .max(4)
          .describe("Two to four assets to compare"),
      },
      async ({ assets }) => {
        try {
          const reports = [];
          for (const a of assets) {
            reports.push(await withReportSlot(() => generateReport(a.type, a.id)));
          }
          return jsonResult(summarizeComparison(reports));
        } catch (e) {
          return errorResult(e);
        }
      },
    );

    server.tool(
      "get_market_regime",
      "Get the current crypto market regime: risk-on, neutral, or risk-off, " +
        "with the BTC trend, momentum, Fear and Greed, and breadth components " +
        "behind it. Call this when the user asks about overall market " +
        "conditions or whether now is a good time to be exposed.",
      {},
      async () => {
        try {
          const snapshot = await getProvider().getMarketSnapshot();
          return jsonResult({
            regime: summarizeRegime(computeRegime(snapshot)),
            trending: snapshot.trending,
          });
        } catch (e) {
          return errorResult(e);
        }
      },
    );
  },
  {
    serverInfo: { name: "tokenlens", version: "1.0.0" },
  },
  {
    basePath: "/api",
    maxDuration: 120,
    verboseLogs: false,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
