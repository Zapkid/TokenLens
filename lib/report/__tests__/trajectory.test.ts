import { describe, expect, it } from "vitest";
import { synthSeries } from "../../providers/fixture";
import type { DecisionEvent } from "../../types";
import { computeTrajectory, type TrajectoryContext } from "../trajectory";

const NEUTRAL_CTX: TrajectoryContext = {
  regimeState: "neutral",
  ownHistoryPercentile: 50,
  mcFdvRatio: 1,
  trendStructure: 0,
  events: [],
};

const series = synthSeries("test:asset", 100, 730, 0.6, 0.1);

describe("computeTrajectory", () => {
  it("declares insufficient history below 180 closes and forces no score", () => {
    const short = synthSeries("test:short", 100, 90, 0.6, 0);
    const t = computeTrajectory("price", short, NEUTRAL_CTX);
    expect(t.insufficientHistory).toBe(true);
    expect(t.horizons).toEqual([]);
  });

  it("produces three horizons with probabilities summing to 100", () => {
    const t = computeTrajectory("price", series, NEUTRAL_CTX);
    expect(t.insufficientHistory).toBe(false);
    expect(t.horizons.map((h) => h.horizonMonths)).toEqual([3, 6, 12]);
    for (const h of t.horizons) {
      const total = h.scenarios.reduce((a, s) => a + s.probability, 0);
      expect(total).toBe(100);
    }
  });

  it("orders scenario bands: bear below base below bull, widening with horizon", () => {
    const t = computeTrajectory("price", series, NEUTRAL_CTX);
    for (const h of t.horizons) {
      const by = Object.fromEntries(h.scenarios.map((s) => [s.key, s]));
      expect(by.bear.high).toBeLessThanOrEqual(by.base.low + 1e-9);
      expect(by.base.high).toBeLessThanOrEqual(by.bull.low + 1e-9);
    }
    const h3 = t.horizons[0].scenarios.find((s) => s.key === "bull")!;
    const h12 = t.horizons[2].scenarios.find((s) => s.key === "bull")!;
    expect(h12.high).toBeGreaterThan(h3.high);
  });

  it("shifts probability toward bull in risk-on regimes and records the modifier", () => {
    const neutral = computeTrajectory("price", series, NEUTRAL_CTX);
    const riskOn = computeTrajectory("price", series, {
      ...NEUTRAL_CTX,
      regimeState: "risk-on",
    });
    const bullNeutral = neutral.horizons[0].scenarios.find((s) => s.key === "bull")!;
    const bullOn = riskOn.horizons[0].scenarios.find((s) => s.key === "bull")!;
    expect(bullOn.probability).toBeGreaterThan(bullNeutral.probability);
    expect(riskOn.modifiers.some((m) => m.key === "regime")).toBe(true);
  });

  it("trims the bull case when trading in the top valuation decile", () => {
    const stretched = computeTrajectory("price", series, {
      ...NEUTRAL_CTX,
      ownHistoryPercentile: 95,
    });
    const bull = stretched.horizons[0].scenarios.find((s) => s.key === "bull")!;
    expect(bull.probability).toBeLessThan(25);
    expect(stretched.modifiers.some((m) => m.key === "valuation")).toBe(true);
  });

  it("widens the bear case under heavy dilution overhang", () => {
    const diluted = computeTrajectory("price", series, {
      ...NEUTRAL_CTX,
      mcFdvRatio: 0.3,
    });
    const neutral = computeTrajectory("price", series, NEUTRAL_CTX);
    const bearDiluted = diluted.horizons[1].scenarios.find((s) => s.key === "bear")!;
    const bearNeutral = neutral.horizons[1].scenarios.find((s) => s.key === "bear")!;
    expect(bearDiluted.low).toBeLessThan(bearNeutral.low);
    expect(bearDiluted.probability).toBeGreaterThan(bearNeutral.probability);
  });

  it("widens both tails when high impact decisions are pending", () => {
    const events: DecisionEvent[] = [
      {
        date: "2026-09-01",
        type: "regulatory",
        title: "ETF ruling",
        impact: "high",
        scope: "asset",
      },
    ];
    const withEvents = computeTrajectory("price", series, {
      ...NEUTRAL_CTX,
      events,
    });
    const neutral = computeTrajectory("price", series, NEUTRAL_CTX);
    const bullE = withEvents.horizons[0].scenarios.find((s) => s.key === "bull")!;
    const bullN = neutral.horizons[0].scenarios.find((s) => s.key === "bull")!;
    const bearE = withEvents.horizons[0].scenarios.find((s) => s.key === "bear")!;
    const bearN = neutral.horizons[0].scenarios.find((s) => s.key === "bear")!;
    expect(bullE.high).toBeGreaterThan(bullN.high);
    expect(bearE.low).toBeLessThan(bearN.low);
    expect(withEvents.modifiers.some((m) => m.key === "decisions")).toBe(true);
  });

  it("keeps the expected range between the bear low and bull high", () => {
    const t = computeTrajectory("price", series, NEUTRAL_CTX);
    for (const h of t.horizons) {
      const by = Object.fromEntries(h.scenarios.map((s) => [s.key, s]));
      expect(h.expectedLow).toBeGreaterThan(by.bear.low - 1e-9);
      expect(h.expectedHigh).toBeLessThan(by.bull.high + 1e-9);
      expect(h.summary).toContain("Base case");
    }
  });
});
