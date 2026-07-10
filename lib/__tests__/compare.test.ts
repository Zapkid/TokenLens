import { describe, expect, it } from "vitest";
import {
  buildRadarData,
  marketCapOf,
  noDataKey,
  reportSeriesId,
  rescoreAll,
} from "../compare";
import type {
  Metric,
  OpportunityPillarKey,
  PillarScore,
  Report,
  RiskPillarKey,
  WeightSet,
} from "../types";

function pillars<K extends string>(
  scores: Record<K, number | null>,
): PillarScore[] {
  return Object.entries(scores).map(([key, score]) => ({
    key: key as OpportunityPillarKey | RiskPillarKey,
    label: key,
    score: score as number | null,
    inputs: [],
  }));
}

function marketCapMetric(value: number | null): Metric {
  return {
    key: "marketCap",
    label: "Market cap",
    family: "market",
    value,
    format: "usdCompact",
    direction: "neutral",
    percentile: null,
  };
}

function makeReport(opts: {
  id: string;
  name: string;
  symbol: string;
  marketCap: number | null;
  opportunity: Record<OpportunityPillarKey, number | null>;
  risk: Record<RiskPillarKey, number | null>;
}): Report {
  return {
    asset: { id: opts.id, type: "token", name: opts.name, symbol: opts.symbol },
    metrics: [marketCapMetric(opts.marketCap)],
    opportunityPillars: pillars(opts.opportunity),
    riskPillars: pillars(opts.risk),
    // Fields below are not read by lib/compare.ts helpers; cast covers the rest.
  } as unknown as Report;
}

const reportA = makeReport({
  id: "alpha",
  name: "Alpha",
  symbol: "alp",
  marketCap: 1_000_000_000,
  opportunity: {
    fundamentals: 80,
    valuation: 60,
    momentum: 50,
    development: 40,
    narrative: null,
  },
  risk: {
    volatility: 30,
    liquidity: 20,
    tokenomics: 25,
    concentration: 35,
    legal: 50,
    trackRecord: 45,
  },
});

const reportB = makeReport({
  id: "beta",
  name: "Beta",
  symbol: "bet",
  marketCap: 500_000_000,
  opportunity: {
    fundamentals: 30,
    valuation: 70,
    momentum: 65,
    development: 55,
    narrative: 40,
  },
  risk: {
    volatility: 60,
    liquidity: 55,
    tokenomics: 40,
    concentration: 45,
    legal: 50,
    trackRecord: 35,
  },
});

describe("reportSeriesId", () => {
  it("combines asset type and id", () => {
    expect(reportSeriesId(reportA)).toBe("token:alpha");
  });
});

describe("buildRadarData", () => {
  it("has one row per pillar with a value per selected report", () => {
    const data = buildRadarData([reportA, reportB]);
    expect(data.opportunity).toHaveLength(5);
    expect(data.risk).toHaveLength(6);
    expect(data.series.map((s) => s.seriesId)).toEqual([
      reportSeriesId(reportA),
      reportSeriesId(reportB),
    ]);

    const fundamentalsRow = data.opportunity.find((r) => r.pillarKey === "fundamentals");
    expect(fundamentalsRow).toBeDefined();
    expect(fundamentalsRow?.[reportSeriesId(reportA)]).toBe(80);
    expect(fundamentalsRow?.[reportSeriesId(reportB)]).toBe(30);
  });

  it("assigns fixed series colors skipping slot 4", () => {
    const data = buildRadarData([reportA, reportB]);
    expect(data.series[0].color).toBe("var(--series-1)");
    expect(data.series[1].color).toBe("var(--series-2)");
  });

  it("maps null pillar scores to 0 and flags them, never inventing a number", () => {
    const data = buildRadarData([reportA, reportB]);
    const narrativeRow = data.opportunity.find((r) => r.pillarKey === "narrative");
    const idA = reportSeriesId(reportA);
    const idB = reportSeriesId(reportB);

    // reportA has no narrative score.
    expect(narrativeRow?.[idA]).toBe(0);
    expect(narrativeRow?.[noDataKey(idA)]).toBe(true);

    // reportB does have a narrative score, so it should not be flagged.
    expect(narrativeRow?.[idB]).toBe(40);
    expect(narrativeRow?.[noDataKey(idB)]).toBe(false);
  });

  it("drops reports beyond the 4-series max rather than overflowing color slots", () => {
    const extra = makeReport({
      id: "gamma",
      name: "Gamma",
      symbol: "gam",
      marketCap: null,
      opportunity: { fundamentals: 10, valuation: 10, momentum: 10, development: 10, narrative: 10 },
      risk: { volatility: 10, liquidity: 10, tokenomics: 10, concentration: 10, legal: 10, trackRecord: 10 },
    });
    const fifth = makeReport({
      id: "delta",
      name: "Delta",
      symbol: "del",
      marketCap: null,
      opportunity: { fundamentals: 20, valuation: 20, momentum: 20, development: 20, narrative: 20 },
      risk: { volatility: 20, liquidity: 20, tokenomics: 20, concentration: 20, legal: 20, trackRecord: 20 },
    });
    const sixth = makeReport({
      id: "epsilon",
      name: "Epsilon",
      symbol: "eps",
      marketCap: null,
      opportunity: { fundamentals: 5, valuation: 5, momentum: 5, development: 5, narrative: 5 },
      risk: { volatility: 5, liquidity: 5, tokenomics: 5, concentration: 5, legal: 5, trackRecord: 5 },
    });
    const data = buildRadarData([reportA, reportB, extra, fifth, sixth]);
    expect(data.series).toHaveLength(4);
    expect(data.series.map((s) => s.seriesId)).not.toContain(reportSeriesId(sixth));
  });
});

describe("rescoreAll", () => {
  const baseWeights: WeightSet = {
    version: 1,
    opportunity: {
      fundamentals: 0.2,
      valuation: 0.2,
      momentum: 0.2,
      development: 0.2,
      narrative: 0.2,
    },
    risk: {
      volatility: 1 / 6,
      liquidity: 1 / 6,
      tokenomics: 1 / 6,
      concentration: 1 / 6,
      legal: 1 / 6,
      trackRecord: 1 / 6,
    },
  };

  it("recomputes scores per report", () => {
    const results = rescoreAll([reportA, reportB], baseWeights, "balanced");
    expect(results).toHaveLength(2);
    expect(results[0].report).toBe(reportA);
    expect(results[0].scores.opportunity).toBeGreaterThan(0);
  });

  it("shifts the score in the expected direction when a weight increases", () => {
    // reportA's highest opportunity pillar is fundamentals (80); weighting it
    // more heavily should raise the overall opportunity score.
    const heavierWeights: WeightSet = {
      ...baseWeights,
      opportunity: {
        ...baseWeights.opportunity,
        fundamentals: 0.6,
        valuation: 0.1,
        momentum: 0.1,
        development: 0.1,
      },
    };
    const base = rescoreAll([reportA], baseWeights, "balanced")[0].scores.opportunity;
    const heavier = rescoreAll([reportA], heavierWeights, "balanced")[0].scores.opportunity;
    expect(heavier).toBeGreaterThan(base);
  });
});

describe("marketCapOf", () => {
  it("reads the marketCap metric value", () => {
    expect(marketCapOf(reportA)).toBe(1_000_000_000);
  });

  it("returns null when the metric is missing", () => {
    const noMc = makeReport({
      id: "nomc",
      name: "NoMC",
      symbol: "nmc",
      marketCap: null,
      opportunity: { fundamentals: 50, valuation: 50, momentum: 50, development: 50, narrative: 50 },
      risk: { volatility: 50, liquidity: 50, tokenomics: 50, concentration: 50, legal: 50, trackRecord: 50 },
    });
    expect(marketCapOf(noMc)).toBeNull();
  });
});
