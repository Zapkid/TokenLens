import { describe, expect, it } from "vitest";
import type { MarketSnapshotRaw } from "../../providers/types";
import { computeRegime } from "../regime";

function snapshot(overrides: Partial<MarketSnapshotRaw> = {}): MarketSnapshotRaw {
  return {
    btcCloses: [],
    fearGreed: { value: 50, label: "Neutral" },
    totalMarketCapUsd: 3e12,
    marketCapChange24hPct: 0,
    btcDominancePct: 55,
    trending: [],
    ...overrides,
  };
}

function trendingUp(days: number): { t: number; v: number }[] {
  return Array.from({ length: days }, (_, i) => ({
    t: i,
    v: 100 * Math.pow(1.005, i),
  }));
}

function trendingDown(days: number): { t: number; v: number }[] {
  return Array.from({ length: days }, (_, i) => ({
    t: i,
    v: 100 * Math.pow(0.995, i),
  }));
}

describe("computeRegime", () => {
  it("reads risk-on from an uptrend with greed", () => {
    const r = computeRegime(
      snapshot({
        btcCloses: trendingUp(365),
        fearGreed: { value: 75, label: "Greed" },
        marketCapChange24hPct: 2,
      }),
    );
    expect(r.state).toBe("risk-on");
    expect(r.score).toBeGreaterThan(0.2);
    expect(r.components.length).toBeGreaterThanOrEqual(3);
  });

  it("reads risk-off from a downtrend with fear", () => {
    const r = computeRegime(
      snapshot({
        btcCloses: trendingDown(365),
        fearGreed: { value: 20, label: "Extreme Fear" },
        marketCapChange24hPct: -3,
      }),
    );
    expect(r.state).toBe("risk-off");
  });

  it("stays neutral on mixed signals and survives missing data", () => {
    const r = computeRegime(
      snapshot({ btcCloses: [], fearGreed: null, marketCapChange24hPct: null }),
    );
    expect(r.state).toBe("neutral");
  });
});
