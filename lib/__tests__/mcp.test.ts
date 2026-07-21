import { beforeAll, describe, expect, it } from "vitest";
import { generateReport } from "../report/pipeline";
import {
  MCP_DISCLAIMER,
  summarizeComparison,
  summarizePortfolio,
  summarizeRegime,
  summarizeReportForLlm,
  summarizeScenarios,
  summarizeWatchlist,
} from "../mcp";
import { analyzePortfolio } from "../report/strategy";
import type { Position, PriceQuote, Report } from "../types";

beforeAll(() => {
  process.env.TOKENLENS_DATA_MODE = "fixture";
});

describe("summarizeReportForLlm", () => {
  let report: Report;
  beforeAll(async () => {
    report = await generateReport("token", "solana");
  });

  it("keeps identity, scores, and honesty markers", () => {
    const s = summarizeReportForLlm(report);
    expect(s.asset.id).toBe("solana");
    expect(s.asset.type).toBe("token");
    expect(s.dataMode).toBe("fixture");
    expect(s.scores.opportunity).toBe(report.scores.opportunity);
    expect(s.scores.riskGrade).toBe(report.scores.riskGrade);
    expect(s.warnings).toEqual(report.warnings);
    expect(s.disclaimer).toBe(MCP_DISCLAIMER);
  });

  it("preserves null pillar scores instead of inventing neutrality", () => {
    const s = summarizeReportForLlm(report);
    const narrative = s.opportunityPillars.find((p) => p.key === "narrative");
    const source = report.opportunityPillars.find((p) => p.key === "narrative");
    expect(narrative).toBeDefined();
    expect(narrative!.score).toBe(
      source!.score === null ? null : Math.round(source!.score * 10) / 10,
    );
    if (source!.score === null) expect(narrative!.score).toBeNull();
  });

  it("flattens pillar inputs into label: detail strings", () => {
    const s = summarizeReportForLlm(report);
    const withInputs = s.opportunityPillars.find((p) => p.inputs.length > 0);
    expect(withInputs).toBeDefined();
    expect(withInputs!.inputs[0]).toMatch(/: /);
  });

  it("drops chart series but keeps metric values and percentiles", () => {
    const s = summarizeReportForLlm(report) as unknown as Record<string, unknown>;
    expect(s.priceHistory).toBeUndefined();
    const summary = summarizeReportForLlm(report);
    expect(summary.metrics.length).toBe(report.metrics.length);
    const mc = summary.metrics.find((m) => m.key === "marketCap");
    expect(mc?.value).toBe(report.metrics.find((m) => m.key === "marketCap")?.value);
  });

  it("includes the network section for chains and omits it for tokens", async () => {
    const tokenSummary = summarizeReportForLlm(report);
    expect(tokenSummary.network).toBeUndefined();
    const chainReport = await generateReport("chain", "solana");
    const chainSummary = summarizeReportForLlm(chainReport);
    expect(chainSummary.network).toBeDefined();
    expect(chainSummary.network!.topProtocols.length).toBeGreaterThan(0);
    // TVL history stays out of the LLM payload.
    expect(
      (chainSummary.network as unknown as Record<string, unknown>).tvlHistory,
    ).toBeUndefined();
  });
});

describe("summarizeScenarios", () => {
  it("carries all three horizons with probabilities and modifiers", async () => {
    const report = await generateReport("token", "solana");
    const s = summarizeScenarios(report);
    expect(s.price.horizons.map((h) => h.horizonMonths)).toEqual([3, 6, 12]);
    for (const horizon of s.price.horizons) {
      const total = horizon.scenarios.reduce((sum, sc) => sum + sc.probability, 0);
      expect(total).toBeCloseTo(100, 5);
    }
    expect(s.price.modifiers.length).toBe(report.trajectory.modifiers.length);
    expect(s.tvl).toBeUndefined();
    expect(s.disclaimer).toBe(MCP_DISCLAIMER);
  });

  it("includes the TVL trajectory for chains", async () => {
    const report = await generateReport("chain", "solana");
    const s = summarizeScenarios(report);
    expect(s.tvl).toBeDefined();
    expect(s.tvl!.kind).toBe("tvl");
  });
});

describe("summarizeComparison", () => {
  it("builds a per-asset score map and pillar matrix", async () => {
    const a = await generateReport("token", "solana");
    const b = await generateReport("token", "chainlink");
    const c = summarizeComparison([a, b]);
    expect(c.assets.map((x) => x.id)).toEqual(["solana", "chainlink"]);
    expect(c.scores.solana.overall).toBe(a.scores.overall);
    expect(c.scores.chainlink.riskGrade).toBe(b.scores.riskGrade);
    for (const row of c.opportunityPillars) {
      expect(Object.keys(row.scores).sort()).toEqual(["chainlink", "solana"]);
    }
    expect(c.strategyTiers.solana).toBe(a.strategy.tierLabel);
    expect(c.warnings.solana).toEqual(a.warnings);
  });

  it("keeps null pillars null across the matrix", async () => {
    const a = await generateReport("token", "solana");
    const c = summarizeComparison([a, a]);
    const narrativeRow = c.opportunityPillars.find((r) => r.key === "narrative");
    const source = a.opportunityPillars.find((p) => p.key === "narrative");
    if (source!.score === null) {
      expect(narrativeRow!.scores.solana).toBeNull();
    }
  });
});

describe("summarizePortfolio", () => {
  const positions: Position[] = [
    {
      assetId: "solana",
      assetType: "token",
      name: "Solana",
      symbol: "SOL",
      quantity: 2,
      costBasisUsd: 300,
    },
    {
      assetId: "mystery",
      assetType: "token",
      name: "Mystery",
      symbol: "MYS",
      quantity: 10,
      costBasisUsd: 100,
    },
  ];
  const quotes: PriceQuote[] = [
    { id: "solana", priceUsd: 200, change24hPct: 3.2 },
    { id: "mystery", priceUsd: null, change24hPct: null },
  ];

  it("computes per-position P&L and keeps unpriced values null", () => {
    const analysis = analyzePortfolio(positions, quotes, {}, "balanced");
    const s = summarizePortfolio(analysis, quotes, "balanced");
    const sol = s.positions.find((p) => p.assetId === "solana")!;
    expect(sol.valueUsd).toBe(400);
    expect(sol.pnlUsd).toBe(100);
    expect(sol.pnlPct).toBeCloseTo(33.3, 1);
    expect(sol.change24hPct).toBe(3.2);
    const mystery = s.positions.find((p) => p.assetId === "mystery")!;
    expect(mystery.valueUsd).toBeNull();
    expect(mystery.pnlUsd).toBeNull();
    expect(mystery.pnlPct).toBeNull();
    // Total P&L is withheld when any position is unpriced, never guessed.
    expect(s.totalPnlUsd).toBeNull();
    expect(s.unpricedSymbols).toContain("MYS");
    expect(s.disclaimer).toBe(MCP_DISCLAIMER);
  });

  it("reports total P&L when every position is priced", () => {
    const priced = positions.slice(0, 1);
    const analysis = analyzePortfolio(priced, quotes, {}, "aggressive");
    const s = summarizePortfolio(analysis, quotes, "aggressive");
    expect(s.totalPnlUsd).toBe(100);
    expect(s.totalCostBasisUsd).toBe(300);
    expect(s.riskProfile).toBe("aggressive");
    expect(s.tierAllocation.length).toBeGreaterThan(0);
  });
});

describe("summarizeWatchlist", () => {
  it("joins entries with quotes and leaves missing quotes null", () => {
    const s = summarizeWatchlist(
      [
        { id: "solana", type: "token", name: "Solana", symbol: "SOL" },
        { id: "arbitrum", type: "chain", name: "Arbitrum", symbol: "ARB" },
      ],
      [{ id: "solana", priceUsd: 200, change24hPct: -1.5 }],
    );
    expect(s.watchlist).toHaveLength(2);
    expect(s.watchlist[0].priceUsd).toBe(200);
    expect(s.watchlist[1].priceUsd).toBeNull();
  });
});

describe("summarizeRegime", () => {
  it("rounds the composite and passes components through", async () => {
    const report = await generateReport("token", "solana");
    const r = summarizeRegime(report.regime);
    expect(["risk-on", "neutral", "risk-off"]).toContain(r.state);
    expect(r.components.length).toBeGreaterThan(0);
    expect(r.score).toBe(Math.round(report.regime.score * 100) / 100);
  });
});
