import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS } from "../../constants";
import type { PillarScore } from "../../types";
import {
  bandScore,
  computeScores,
  quadrantOf,
  riskGradeOf,
  riskReasons,
} from "../scoring";

function pillars(
  scores: Partial<Record<string, number | null>>,
  keys: string[],
): PillarScore[] {
  return keys.map((k) => ({
    key: k as PillarScore["key"],
    label: k,
    score: scores[k] === undefined ? 50 : scores[k],
    inputs: [{ label: k, detail: `${scores[k] ?? 50} / 100. detail for ${k}` }],
  }));
}

const OPP_KEYS = ["fundamentals", "valuation", "momentum", "development", "narrative"];
const RISK_KEYS = [
  "volatility",
  "liquidity",
  "tokenomics",
  "concentration",
  "legal",
  "trackRecord",
];

describe("bandScore", () => {
  it("interpolates between anchors", () => {
    const anchors: [number, number][] = [
      [0, 0],
      [10, 100],
    ];
    expect(bandScore(5, anchors)).toBe(50);
  });
  it("clamps outside the anchor range", () => {
    const anchors: [number, number][] = [
      [0, 10],
      [10, 90],
    ];
    expect(bandScore(-5, anchors)).toBe(10);
    expect(bandScore(50, anchors)).toBe(90);
  });
  it("passes null through", () => {
    expect(bandScore(null, [[0, 0], [1, 1]])).toBeNull();
  });
});

describe("riskGradeOf", () => {
  it("maps score bands to letter grades", () => {
    expect(riskGradeOf(10)).toBe("A");
    expect(riskGradeOf(30)).toBe("B");
    expect(riskGradeOf(50)).toBe("C");
    expect(riskGradeOf(70)).toBe("D");
    expect(riskGradeOf(95)).toBe("E");
  });
});

describe("quadrantOf", () => {
  it("labels the four corners", () => {
    expect(quadrantOf(70, 30)).toBe("core");
    expect(quadrantOf(70, 70)).toBe("speculative");
    expect(quadrantOf(30, 30)).toBe("stale");
    expect(quadrantOf(30, 70)).toBe("avoid");
  });
});

describe("computeScores", () => {
  it("reproduces the worked example from the plan appendix", () => {
    // Opportunity pillars 72/61/55/80/65 weighted by defaults = 66.6.
    // Risk pillars 60/45/78/50/55/40 weighted by defaults = 56.05.
    // Overall (balanced, 0.6) = 66.6 * (1 - 0.5605 * 0.6) = 44.2.
    const opp = pillars(
      { fundamentals: 72, valuation: 61, momentum: 55, development: 80, narrative: 65 },
      OPP_KEYS,
    );
    const risk = pillars(
      {
        volatility: 60,
        liquidity: 45,
        tokenomics: 78,
        concentration: 50,
        legal: 55,
        trackRecord: 40,
      },
      RISK_KEYS,
    );
    const scores = computeScores(opp, risk, DEFAULT_WEIGHTS, "balanced");
    expect(scores.opportunity).toBeCloseTo(66.6, 1);
    expect(scores.risk).toBeCloseTo(56.1, 1);
    // The appendix rounds pillar blends before the dampener; the engine does
    // not, so the worked example lands within a tenth of the printed 44.2.
    expect(Math.abs(scores.overall - 44.2)).toBeLessThan(0.15);
    expect(scores.riskGrade).toBe("C");
    expect(scores.quadrant).toBe("speculative");
  });

  it("renormalizes weights around pillars with no data", () => {
    const opp = pillars(
      { fundamentals: 80, valuation: 80, momentum: 80, development: 80, narrative: null },
      OPP_KEYS,
    );
    const risk = pillars({}, RISK_KEYS);
    const scores = computeScores(opp, risk, DEFAULT_WEIGHTS, "balanced");
    // Narrative (weight 15%) missing must not drag the average down.
    expect(scores.opportunity).toBe(80);
  });

  it("applies the risk-aversion dampener per profile", () => {
    const opp = pillars({}, OPP_KEYS);
    const risk = pillars({}, RISK_KEYS);
    const conservative = computeScores(opp, risk, DEFAULT_WEIGHTS, "conservative");
    const aggressive = computeScores(opp, risk, DEFAULT_WEIGHTS, "aggressive");
    expect(conservative.overall).toBeLessThan(aggressive.overall);
  });

  it("responds to weight changes in the expected direction", () => {
    const opp = pillars(
      { fundamentals: 90, valuation: 10, momentum: 10, development: 10, narrative: 10 },
      OPP_KEYS,
    );
    const risk = pillars({}, RISK_KEYS);
    const heavyFundamentals = computeScores(
      opp,
      risk,
      {
        ...DEFAULT_WEIGHTS,
        opportunity: { ...DEFAULT_WEIGHTS.opportunity, fundamentals: 0.6, valuation: 0.1 },
      },
      "balanced",
    );
    const defaults = computeScores(opp, risk, DEFAULT_WEIGHTS, "balanced");
    expect(heavyFundamentals.opportunity).toBeGreaterThan(defaults.opportunity);
  });
});

describe("riskReasons", () => {
  it("lists only elevated pillars, riskiest first", () => {
    const risk = pillars(
      { volatility: 80, tokenomics: 65, liquidity: 20 },
      RISK_KEYS,
    );
    const reasons = riskReasons(risk);
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(reasons[0]).toContain("volatility");
    expect(reasons.join(" ")).not.toContain("liquidity: 20");
  });
});
