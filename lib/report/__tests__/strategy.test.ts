import { describe, expect, it } from "vitest";
import type { ComputedScores, Position, PriceQuote } from "../../types";
import {
  analyzePortfolio,
  buildStrategyGuidance,
  classifyTier,
  dcaSchedule,
  dcaWeeksFor,
} from "../strategy";

function scores(partial: Partial<ComputedScores>): ComputedScores {
  return {
    opportunity: 50,
    risk: 50,
    overall: 35,
    riskGrade: "C",
    quadrant: "stale",
    riskProfile: "balanced",
    ...partial,
  };
}

describe("classifyTier", () => {
  it("reserves core for BTC/ETH with strong grades", () => {
    expect(classifyTier("bitcoin", scores({ riskGrade: "B" }))).toBe("core");
    expect(classifyTier("ethereum", scores({ riskGrade: "A" }))).toBe("core");
    // A strong grade on anything else is quality at best.
    expect(classifyTier("solana", scores({ riskGrade: "B", opportunity: 70 }))).toBe(
      "quality",
    );
  });
  it("requires opportunity 60+ for quality and 70+ for speculative", () => {
    expect(classifyTier("solana", scores({ riskGrade: "C", opportunity: 59 }))).toBe(
      "avoid",
    );
    expect(classifyTier("pepe", scores({ riskGrade: "E", opportunity: 71 }))).toBe(
      "speculative",
    );
    expect(classifyTier("pepe", scores({ riskGrade: "E", opportunity: 50 }))).toBe(
      "avoid",
    );
  });
});

describe("dcaWeeksFor", () => {
  it("stretches entries in risk-on and shortens them in risk-off", () => {
    expect(dcaWeeksFor("risk-on")).toBeGreaterThan(dcaWeeksFor("neutral"));
    expect(dcaWeeksFor("risk-off")).toBeLessThan(dcaWeeksFor("neutral"));
  });
});

describe("dcaSchedule", () => {
  it("splits the amount into weekly installments", () => {
    const rows = dcaSchedule(1200, 4, new Date("2026-07-08T00:00:00Z"));
    expect(rows).toHaveLength(4);
    expect(rows[0].amountUsd).toBe(300);
    expect(rows[0].dateIso).toBe("2026-07-08");
    expect(rows[3].dateIso).toBe("2026-07-29");
  });
  it("returns nothing for non-positive inputs", () => {
    expect(dcaSchedule(0, 4)).toEqual([]);
    expect(dcaSchedule(100, 0)).toEqual([]);
  });
});

describe("buildStrategyGuidance", () => {
  it("caps speculative positions hard", () => {
    const g = buildStrategyGuidance(
      "pepe",
      scores({ riskGrade: "E", opportunity: 75 }),
      "neutral",
    );
    expect(g.tier).toBe("speculative");
    expect(g.maxPositionPct).toBeLessThanOrEqual(3);
    expect(g.exitLadder.length).toBeGreaterThan(0);
  });
});

const POSITIONS: Position[] = [
  { assetId: "bitcoin", assetType: "token", name: "Bitcoin", symbol: "BTC", quantity: 0.5, costBasisUsd: 40000 },
  { assetId: "solana", assetType: "token", name: "Solana", symbol: "SOL", quantity: 100, costBasisUsd: 12000 },
  { assetId: "pepe", assetType: "token", name: "Pepe", symbol: "PEPE", quantity: 1e9, costBasisUsd: 5000 },
];
const QUOTES: PriceQuote[] = [
  { id: "bitcoin", priceUsd: 100000, change24hPct: 1 },
  { id: "solana", priceUsd: 200, change24hPct: 2 },
  { id: "pepe", priceUsd: 0.00001, change24hPct: -3 },
];
const TIERS = {
  bitcoin: "core" as const,
  solana: "quality" as const,
  pepe: "speculative" as const,
};

describe("analyzePortfolio", () => {
  it("values positions and computes tier allocations", () => {
    const a = analyzePortfolio(POSITIONS, QUOTES, TIERS, "balanced");
    expect(a.totalValueUsd).toBeCloseTo(50000 + 20000 + 10000);
    const core = a.tiers.find((t) => t.tier === "core")!;
    expect(core.actualPct).toBeCloseTo(62.5, 1);
    expect(core.targetPct).toBe(50);
    expect(core.outsideBand).toBe(false); // 62.5 vs 50 is exactly at the 25% band edge
  });

  it("proposes trades when drift exceeds the band", () => {
    // Everything in one speculative position: massively over target.
    const a = analyzePortfolio(
      [POSITIONS[2]],
      QUOTES,
      TIERS,
      "balanced",
    );
    const spec = a.tiers.find((t) => t.tier === "speculative")!;
    expect(spec.outsideBand).toBe(true);
    expect(a.suggestions.some((s) => s.action === "trim" && s.tier === "speculative")).toBe(
      true,
    );
    expect(a.suggestions.some((s) => s.detail.includes("harvest into core"))).toBe(true);
  });

  it("flags single positions above the per-alt cap", () => {
    const a = analyzePortfolio(POSITIONS, QUOTES, TIERS, "balanced");
    // SOL is 25% of the portfolio, above the 10% single-alt cap.
    expect(a.suggestions.some((s) => s.detail.includes("SOL"))).toBe(true);
  });

  it("treats unclassified and unpriced holdings honestly", () => {
    const a = analyzePortfolio(
      [{ assetId: "mystery", assetType: "token", name: "Mystery", symbol: "MYS", quantity: 10, costBasisUsd: 100 }],
      [],
      {},
      "balanced",
    );
    expect(a.positions[0].tier).toBe("speculative");
    expect(a.unpriced).toEqual(["MYS"]);
  });
});
