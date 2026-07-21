// MCP server for TokenLens. Exposes the analysis engine as Model Context
// Protocol tools over streamable HTTP at /api/mcp, so Claude (claude.ai
// custom connectors, Claude Code, Claude Desktop) can run token and chain
// analysis conversationally. Tools call the same lib/ functions the UI
// uses and share the in-process report cache. Read-only: no tool mutates
// state, and personal data (portfolio, watchlist) lives in the browser's
// localStorage where this server cannot reach it.

import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import {
  summarizeComparison,
  summarizePortfolio,
  summarizeRegime,
  summarizeReportForLlm,
  summarizeScenarios,
  summarizeWatchlist,
} from "@/lib/mcp";
import { getProvider } from "@/lib/providers";
import { analyzePortfolio } from "@/lib/report/strategy";
import { generateReport } from "@/lib/report/pipeline";
import { computeRegime } from "@/lib/report/regime";
import {
  addPositionEntry,
  addWatchlistEntry,
  getPersonalState,
  mutatePersonalState,
  personalTokenConfigured,
  removePositionEntries,
  removeWatchlistEntry,
  verifyPersonalToken,
} from "@/lib/server/personal";

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

// Personal tools require the deployment's bearer token. withMcpAuth
// verifies it and exposes authInfo to tool callbacks; analysis tools stay
// public (required: false), so only personal tools check this.
function requirePersonalAuth(extra: { authInfo?: { token?: string } }) {
  if (!extra.authInfo?.token) {
    throw new Error(
      "Personal tools require the TokenLens personal token as an Authorization bearer header",
    );
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

    // Personal tools: registered only when the deployment configures a
    // token, so an unconfigured instance exposes no personal surface at
    // all. Registration is env-driven and therefore stable per deployment.
    if (personalTokenConfigured()) {
      const assetRefShape = {
        id: z.string().min(1).describe("TokenLens asset id from search_assets"),
        type: assetTypeSchema,
        name: z.string().min(1).describe("Display name, e.g. Solana"),
        symbol: z.string().min(1).describe("Ticker symbol, e.g. SOL"),
      };

      server.tool(
        "get_watchlist",
        "Read the user's TokenLens watchlist with current prices and 24h " +
          "change. Call this when the user asks what they are watching or " +
          "wants a status pass over their watched assets.",
        {},
        async (_args, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await getPersonalState();
            const ids = Array.from(new Set(state.watchlist.map((a) => a.id)));
            const quotes = ids.length ? await getProvider().getPrices(ids) : [];
            return jsonResult(summarizeWatchlist(state.watchlist, quotes));
          } catch (e) {
            return errorResult(e);
          }
        },
      );

      server.tool(
        "add_to_watchlist",
        "Add a token or chain to the user's TokenLens watchlist. Use " +
          "search_assets first to resolve the id, name, and symbol. Adding " +
          "an asset that is already watched is a no-op.",
        assetRefShape,
        async ({ id, type, name, symbol }, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await mutatePersonalState((s) =>
              addWatchlistEntry(s, { id, type, name, symbol }),
            );
            return jsonResult({ ok: true, watchlistSize: state.watchlist.length });
          } catch (e) {
            return errorResult(e);
          }
        },
      );

      server.tool(
        "remove_from_watchlist",
        "Remove a token or chain from the user's TokenLens watchlist.",
        {
          id: z.string().min(1).describe("TokenLens asset id"),
          type: assetTypeSchema,
        },
        async ({ id, type }, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await mutatePersonalState((s) =>
              removeWatchlistEntry(s, id, type),
            );
            return jsonResult({ ok: true, watchlistSize: state.watchlist.length });
          } catch (e) {
            return errorResult(e);
          }
        },
      );

      server.tool(
        "get_portfolio",
        "Read the user's TokenLens portfolio: positions valued at current " +
          "prices with P&L, tier allocation versus the risk profile target, " +
          "drift flags, and rebalancing suggestions. Call this when the user " +
          "asks how their portfolio is doing or whether to rebalance.",
        {
          riskProfile: z
            .enum(["conservative", "balanced", "aggressive"])
            .optional()
            .describe(
              "Target allocation template to compare against; defaults to balanced",
            ),
        },
        async ({ riskProfile }, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await getPersonalState();
            const ids = Array.from(new Set(state.positions.map((p) => p.assetId)));
            const quotes = ids.length ? await getProvider().getPrices(ids) : [];
            const profile = riskProfile ?? "balanced";
            const analysis = analyzePortfolio(
              state.positions,
              quotes,
              state.assetTiers,
              profile,
            );
            return jsonResult(summarizePortfolio(analysis, quotes, profile));
          } catch (e) {
            return errorResult(e);
          }
        },
      );

      server.tool(
        "add_position",
        "Record a portfolio position (a lot) for a token or chain: quantity " +
          "held and total cost basis in USD. Multiple lots per asset are " +
          "allowed and are listed separately. Use search_assets first to " +
          "resolve the asset id.",
        {
          ...assetRefShape,
          quantity: z.number().positive().describe("Units held, e.g. 2.5"),
          costBasisUsd: z
            .number()
            .min(0)
            .describe("Total cost basis in USD for this lot, not per unit"),
        },
        async ({ id, type, name, symbol, quantity, costBasisUsd }, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await mutatePersonalState((s) =>
              addPositionEntry(s, {
                assetId: id,
                assetType: type,
                name,
                symbol,
                quantity,
                costBasisUsd,
              }),
            );
            return jsonResult({ ok: true, positionCount: state.positions.length });
          } catch (e) {
            return errorResult(e);
          }
        },
      );

      server.tool(
        "remove_position",
        "Remove every recorded lot of one asset from the user's portfolio. " +
          "Confirm with the user before calling this; it cannot be undone " +
          "from the conversation.",
        { id: z.string().min(1).describe("TokenLens asset id to remove") },
        async ({ id }, extra) => {
          try {
            requirePersonalAuth(extra);
            const state = await mutatePersonalState((s) =>
              removePositionEntries(s, id),
            );
            return jsonResult({ ok: true, positionCount: state.positions.length });
          } catch (e) {
            return errorResult(e);
          }
        },
      );
    }

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

// Auth wrapper: verifies the personal bearer token when one is presented
// and exposes it to tools as authInfo. required stays false so the public
// analysis tools keep working with no credentials; the personal tools
// enforce authInfo presence themselves.
const authedHandler = withMcpAuth(
  handler,
  (_req, bearerToken) => {
    if (!bearerToken || !verifyPersonalToken(bearerToken)) return undefined;
    return {
      token: bearerToken,
      clientId: "tokenlens-personal",
      scopes: ["personal"],
    };
  },
  { required: false },
);

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };
