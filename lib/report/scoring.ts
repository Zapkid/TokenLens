// Pillar scores and composite scoring. Pure functions: the server computes
// defaults, the client recomputes live when the user edits weights, so both
// must share this module.

import {
  OPPORTUNITY_PILLAR_LABELS,
  RISK_AVERSION,
  RISK_PILLAR_LABELS,
} from "../constants";
import { clamp } from "../math";
import type {
  ComputedScores,
  Metric,
  OpportunityPillarKey,
  PillarInput,
  PillarScore,
  QuadrantKey,
  RiskGrade,
  RiskPillarKey,
  RiskProfile,
  WeightSet,
} from "../types";

export interface ScoringContext {
  /** Percentile of current price within the asset's own trailing history (0-100). */
  ownHistoryPercentile: number | null;
  assetAgeDays: number | null;
  marketCapRank: number | null;
  isChain: boolean;
}

function metric(metrics: Metric[], key: string): Metric | undefined {
  return metrics.find((m) => m.key === key);
}

/** Direction-adjusted 0-100 score from a metric's cohort percentile. */
function percentileScore(m: Metric | undefined): number | null {
  if (!m || m.percentile === null) return null;
  if (m.direction === "lower") return 100 - m.percentile;
  return m.percentile;
}

/** Map a raw value onto a 0-100 score through piecewise-linear band anchors. */
export function bandScore(
  value: number | null,
  anchors: [number, number][],
): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const sorted = [...anchors].sort((a, b) => a[0] - b[0]);
  if (value <= sorted[0][0]) return sorted[0][1];
  if (value >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];
  for (let i = 1; i < sorted.length; i++) {
    const [x0, y0] = sorted[i - 1];
    const [x1, y1] = sorted[i];
    if (value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return sorted[sorted.length - 1][1];
}

function avg(parts: (number | null)[]): number | null {
  const xs = parts.filter((x): x is number => x !== null && Number.isFinite(x));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function describe(label: string, score: number | null, extra?: string): PillarInput {
  const detail =
    score === null ? "No usable data" : `${Math.round(score)} / 100${extra ? `. ${extra}` : ""}`;
  return { label, detail };
}

export function buildOpportunityPillars(
  metrics: Metric[],
  ctx: ScoringContext,
): PillarScore[] {
  const out: PillarScore[] = [];

  // Fundamentals and usage
  {
    const parts: (number | null)[] = [];
    const inputs: PillarInput[] = [];
    if (ctx.isChain) {
      const tvlPct = percentileScore(metric(metrics, "chainTvl"));
      const tvlGrowth = bandScore(metric(metrics, "tvlChange90d")?.value ?? null, [
        [-0.4, 10],
        [0, 45],
        [0.3, 75],
        [1.0, 95],
      ]);
      const mcTvlScore = bandScore(metric(metrics, "mcTvl")?.value ?? null, [
        [1, 90],
        [5, 65],
        [15, 40],
        [50, 15],
      ]);
      const feesScore = bandScore(metric(metrics, "chainFees24h")?.value ?? null, [
        [1e4, 15],
        [1e5, 40],
        [1e6, 70],
        [1e7, 95],
      ]);
      parts.push(tvlPct, tvlGrowth, mcTvlScore, feesScore);
      inputs.push(
        describe("Chain TVL vs peers", tvlPct),
        describe("TVL growth (90d)", tvlGrowth),
        describe("Native MC / TVL valuation", mcTvlScore),
        describe("Chain fee level", feesScore),
      );
    } else {
      const turnover = percentileScore(metric(metrics, "turnover"));
      const volume = percentileScore(metric(metrics, "volume24h"));
      const mcFdv = percentileScore(metric(metrics, "mcFdv"));
      parts.push(turnover, volume, mcFdv);
      inputs.push(
        describe("Turnover vs peers", turnover, "Real usage proxy"),
        describe("Volume vs peers", volume),
        describe("MC/FDV vs peers", mcFdv),
      );
    }
    out.push({
      key: "fundamentals",
      label: OPPORTUNITY_PILLAR_LABELS.fundamentals,
      score: avg(parts),
      inputs,
    });
  }

  // Valuation headroom
  {
    const athDist = metric(metrics, "athDistance")?.value ?? null;
    const ret365 = metric(metrics, "return365d")?.value ?? null;
    // Deep below ATH is headroom only when the asset is not in freefall.
    const athHeadroom =
      athDist === null
        ? null
        : ret365 !== null && ret365 < -0.5
          ? bandScore(athDist, [
              [-0.95, 25],
              [-0.5, 35],
              [0, 40],
            ])
          : bandScore(athDist, [
              [-0.9, 85],
              [-0.5, 70],
              [-0.2, 50],
              [0, 30],
            ]);
    const ownHistory =
      ctx.ownHistoryPercentile === null ? null : 100 - ctx.ownHistoryPercentile;
    const inputs = [
      describe("ATH distance headroom", athHeadroom),
      describe(
        "Price percentile in own 2y history (inverted)",
        ownHistory,
        "Low percentile means more headroom",
      ),
    ];
    out.push({
      key: "valuation",
      label: OPPORTUNITY_PILLAR_LABELS.valuation,
      score: avg([athHeadroom, ownHistory]),
      inputs,
    });
  }

  // Momentum and trend
  {
    const trend = metric(metrics, "trendStructure")?.value ?? null;
    const trendScore = trend === null ? null : trend === 1 ? 80 : trend === -1 ? 20 : 50;
    const rel90 = percentileScore(metric(metrics, "return90d"));
    const sharpe = bandScore(metric(metrics, "sharpe1y")?.value ?? null, [
      [-1, 15],
      [0, 40],
      [1, 70],
      [2.5, 95],
    ]);
    out.push({
      key: "momentum",
      label: OPPORTUNITY_PILLAR_LABELS.momentum,
      score: avg([trendScore, rel90, sharpe]),
      inputs: [
        describe("50/200d trend structure", trendScore),
        describe("90d return vs peers", rel90),
        describe("Risk-adjusted return (1y)", sharpe),
      ],
    });
  }

  // Development and ecosystem
  {
    const commits = bandScore(metric(metrics, "commits4w")?.value ?? null, [
      [0, 5],
      [10, 35],
      [50, 60],
      [150, 85],
      [300, 95],
    ]);
    const contributors = bandScore(metric(metrics, "contributors")?.value ?? null, [
      [0, 5],
      [5, 35],
      [20, 60],
      [60, 85],
      [120, 95],
    ]);
    const protocolBreadth = ctx.isChain
      ? bandScore(metric(metrics, "protocolCount")?.value ?? null, [
          [3, 20],
          [20, 50],
          [100, 75],
          [400, 95],
        ])
      : null;
    out.push({
      key: "development",
      label: OPPORTUNITY_PILLAR_LABELS.development,
      score: avg([commits, contributors, protocolBreadth]),
      inputs: [
        describe("Commit activity (4w)", commits),
        describe("Contributor count", contributors),
        ...(ctx.isChain ? [describe("Ecosystem breadth", protocolBreadth)] : []),
      ],
    });
  }

  // Narrative and catalysts: the news signal engine is not wired in this
  // build, so this pillar reports no data and the weights renormalize.
  out.push({
    key: "narrative",
    label: OPPORTUNITY_PILLAR_LABELS.narrative,
    score: null,
    inputs: [
      {
        label: "News signals",
        detail:
          "Not wired in this build. The pillar is excluded and other weights renormalize.",
      },
    ],
  });

  return out;
}

export function buildRiskPillars(metrics: Metric[], ctx: ScoringContext): PillarScore[] {
  const out: PillarScore[] = [];

  // Volatility and drawdown
  {
    const vol = bandScore(metric(metrics, "vol90")?.value ?? null, [
      [0.35, 15],
      [0.6, 40],
      [0.9, 65],
      [1.3, 90],
    ]);
    const dd = bandScore(metric(metrics, "maxDrawdown1y")?.value ?? null, [
      [-0.9, 95],
      [-0.6, 70],
      [-0.35, 45],
      [-0.15, 20],
    ]);
    const downside = bandScore(metric(metrics, "downsideDeviation")?.value ?? null, [
      [0.3, 20],
      [0.6, 50],
      [1.0, 85],
    ]);
    out.push({
      key: "volatility",
      label: RISK_PILLAR_LABELS.volatility,
      score: avg([vol, dd, downside]),
      inputs: [
        describe("90d realized volatility", vol),
        describe("1y max drawdown", dd),
        describe("Downside deviation", downside),
      ],
    });
  }

  // Liquidity (risk = illiquidity)
  {
    const turnoverPct = percentileScore(metric(metrics, "turnover"));
    const volumePct = percentileScore(metric(metrics, "volume24h"));
    const illiq = avg([
      turnoverPct === null ? null : 100 - turnoverPct,
      volumePct === null ? null : 100 - volumePct,
    ]);
    out.push({
      key: "liquidity",
      label: RISK_PILLAR_LABELS.liquidity,
      score: illiq,
      inputs: [
        describe(
          "Illiquidity vs peers",
          illiq,
          "Inverse of turnover and volume percentiles",
        ),
      ],
    });
  }

  // Tokenomics and dilution
  {
    const overhang = metric(metrics, "dilutionOverhang")?.value ?? null;
    const overhangScore = bandScore(overhang, [
      [0, 10],
      [0.15, 30],
      [0.4, 65],
      [0.66, 90],
    ]);
    out.push({
      key: "tokenomics",
      label: RISK_PILLAR_LABELS.tokenomics,
      score: overhangScore,
      inputs: [
        describe(
          "Dilution overhang (1 - MC/FDV)",
          overhangScore,
          overhang !== null
            ? `${Math.round(overhang * 100)}% of fully diluted supply is not yet circulating`
            : undefined,
        ),
      ],
    });
  }

  // Concentration and dependence
  {
    if (ctx.isChain) {
      const topShare = metric(metrics, "topProtocolShare")?.value ?? null;
      const score = bandScore(topShare, [
        [0.1, 20],
        [0.3, 45],
        [0.5, 70],
        [0.8, 95],
      ]);
      out.push({
        key: "concentration",
        label: RISK_PILLAR_LABELS.concentration,
        score,
        inputs: [
          describe(
            "Top protocol share of chain TVL",
            score,
            topShare !== null
              ? `${Math.round(topShare * 100)}% of TVL sits in one protocol`
              : undefined,
          ),
        ],
      });
    } else {
      // Holder concentration is not consistently obtainable; market cap rank
      // serves as a labeled proxy for dependence and depth.
      const rankScore = bandScore(ctx.marketCapRank, [
        [1, 15],
        [10, 30],
        [50, 55],
        [150, 75],
        [500, 90],
      ]);
      out.push({
        key: "concentration",
        label: RISK_PILLAR_LABELS.concentration,
        score: rankScore,
        inputs: [
          describe(
            "Market depth proxy (cap rank)",
            rankScore,
            "Holder concentration data is not wired; rank is a labeled proxy",
          ),
        ],
      });
    }
  }

  // Legal and regulatory: auto baseline only in this build.
  {
    const base = ctx.marketCapRank !== null && ctx.marketCapRank <= 10 ? 35 : 50;
    out.push({
      key: "legal",
      label: RISK_PILLAR_LABELS.legal,
      score: base,
      inputs: [
        {
          label: "Auto baseline",
          detail: `${base} / 100. Not manually reviewed. Litigation and classification feeds are not wired in this build.`,
        },
      ],
    });
  }

  // Track record and security
  {
    const age = bandScore(ctx.assetAgeDays, [
      [180, 90],
      [730, 65],
      [1460, 45],
      [3000, 25],
      [5000, 15],
    ]);
    out.push({
      key: "trackRecord",
      label: RISK_PILLAR_LABELS.trackRecord,
      score: age,
      inputs: [
        describe(
          "Asset age and cycle survival",
          age,
          ctx.assetAgeDays !== null
            ? `${Math.round(ctx.assetAgeDays / 365)} years of trading history`
            : undefined,
        ),
      ],
    });
  }

  return out;
}

function weightedScore(
  pillars: PillarScore[],
  weights: Record<string, number>,
): number {
  let sum = 0;
  let weightSum = 0;
  for (const p of pillars) {
    if (p.score === null) continue;
    const w = weights[p.key] ?? 0;
    sum += p.score * w;
    weightSum += w;
  }
  if (weightSum === 0) return 50;
  return clamp(sum / weightSum, 0, 100);
}

export function riskGradeOf(risk: number): RiskGrade {
  if (risk <= 20) return "A";
  if (risk <= 40) return "B";
  if (risk <= 60) return "C";
  if (risk <= 80) return "D";
  return "E";
}

export function quadrantOf(opportunity: number, risk: number): QuadrantKey {
  const highOpp = opportunity >= 55;
  const highRisk = risk >= 50;
  if (highOpp && !highRisk) return "core";
  if (highOpp && highRisk) return "speculative";
  if (!highOpp && !highRisk) return "stale";
  return "avoid";
}

export const QUADRANT_LABELS: Record<QuadrantKey, string> = {
  core: "Core",
  speculative: "Speculative bet",
  stale: "Stable but stale",
  avoid: "Avoid",
};

export function computeScores(
  opportunityPillars: PillarScore[],
  riskPillars: PillarScore[],
  weights: WeightSet,
  profile: RiskProfile,
): ComputedScores {
  const opportunity = weightedScore(
    opportunityPillars,
    weights.opportunity as Record<OpportunityPillarKey, number>,
  );
  const risk = weightedScore(riskPillars, weights.risk as Record<RiskPillarKey, number>);
  const overall = opportunity * (1 - (risk / 100) * RISK_AVERSION[profile]);
  return {
    opportunity: Math.round(opportunity * 10) / 10,
    risk: Math.round(risk * 10) / 10,
    overall: Math.round(overall * 10) / 10,
    riskGrade: riskGradeOf(risk),
    quadrant: quadrantOf(opportunity, risk),
    riskProfile: profile,
  };
}

/** Human readable reasons for the risk grade, pulled from the riskiest pillars. */
export function riskReasons(riskPillars: PillarScore[]): string[] {
  return riskPillars
    .filter((p) => p.score !== null && p.score >= 55)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((p) => {
      const detail = p.inputs[0]?.detail ?? "";
      return `${p.label}: ${Math.round(p.score ?? 0)} / 100. ${detail.split(". ").slice(1).join(". ")}`.trim();
    });
}
