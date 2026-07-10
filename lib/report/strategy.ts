// Strategy engine: tier classification, position sizing guidance, DCA
// scheduling, exit ladders, and portfolio rebalancing. Shared by the report
// Strategy section and the Portfolio page.

import {
  ALLOCATION_TEMPLATES,
  MAX_SINGLE_ALT_PCT,
  REBALANCE_DRIFT_BAND,
} from "../constants";
import type {
  ComputedScores,
  ExitRung,
  Position,
  PriceQuote,
  RegimeState,
  RiskProfile,
  StrategyGuidance,
  StrategyTier,
} from "../types";

export const TIER_LABELS: Record<StrategyTier, string> = {
  core: "Core (BTC/ETH tier)",
  quality: "Quality alt",
  speculative: "Speculative",
  avoid: "No allocation suggested",
};

const CORE_IDS = new Set(["bitcoin", "ethereum"]);

export function classifyTier(assetId: string, scores: ComputedScores): StrategyTier {
  const grade = scores.riskGrade;
  if (CORE_IDS.has(assetId) && (grade === "A" || grade === "B")) return "core";
  if ((grade === "B" || grade === "C") && scores.opportunity >= 60) return "quality";
  if ((grade === "D" || grade === "E") && scores.opportunity >= 70) return "speculative";
  // Anything that clears neither bar gets no suggested allocation.
  return "avoid";
}

export function dcaWeeksFor(regime: RegimeState): number {
  // Longer DCA in risk-on (expensive) regimes, shorter in risk-off (cheap) ones.
  if (regime === "risk-on") return 12;
  if (regime === "risk-off") return 4;
  return 8;
}

const DEFAULT_EXIT_LADDER: ExitRung[] = [
  { trigger: "Position up 50% from cost basis", action: "Sell 20%" },
  { trigger: "Position up 100% from cost basis", action: "Sell 20%" },
  { trigger: "Position up 200% from cost basis", action: "Sell 25%" },
];

export function buildStrategyGuidance(
  assetId: string,
  scores: ComputedScores,
  regime: RegimeState,
): StrategyGuidance {
  const tier = classifyTier(assetId, scores);
  const dcaWeeks = dcaWeeksFor(regime);
  const maxPositionPct =
    tier === "core" ? 70 : tier === "quality" ? MAX_SINGLE_ALT_PCT : tier === "speculative" ? 3 : 0;

  const rationale =
    tier === "core"
      ? `Risk grade ${scores.riskGrade} with majors-tier depth. Suitable as a portfolio anchor.`
      : tier === "quality"
        ? `Risk grade ${scores.riskGrade} with opportunity ${scores.opportunity}. Qualifies for the quality alt tier.`
        : tier === "speculative"
          ? `Risk grade ${scores.riskGrade} with opportunity ${scores.opportunity}. High potential paired with high risk: speculative tier only, hard cap per position.`
          : `Risk grade ${scores.riskGrade} with opportunity ${scores.opportunity} clears neither the quality bar (grade B-C and opportunity 60+) nor the speculative bar (opportunity 70+).`;

  return {
    tier,
    tierLabel: TIER_LABELS[tier],
    rationale,
    maxPositionPct,
    dcaWeeks,
    dcaNote:
      regime === "risk-on"
        ? "Regime is risk-on and valuations are extended: spread entries over a longer schedule."
        : regime === "risk-off"
          ? "Regime is risk-off: a shorter schedule captures depressed prices faster."
          : "Neutral regime: default schedule.",
    exitLadder: DEFAULT_EXIT_LADDER,
    reviewTriggers: [
      "Position falls 30% from your cost basis: reassess, do not auto-sell",
      "Risk grade deteriorates by a full letter on refresh",
      "A scheduled unlock above 2% of supply approaches (verify unlock data externally; not wired in this build)",
    ],
  };
}

export interface DcaInstallment {
  week: number;
  dateIso: string;
  amountUsd: number;
}

export function dcaSchedule(
  totalUsd: number,
  weeks: number,
  start: Date = new Date(),
): DcaInstallment[] {
  if (totalUsd <= 0 || weeks <= 0) return [];
  const per = totalUsd / weeks;
  return Array.from({ length: weeks }, (_, i) => ({
    week: i + 1,
    dateIso: new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    amountUsd: Math.round(per * 100) / 100,
  }));
}

export interface PositionValue extends Position {
  valueUsd: number | null;
  tier: StrategyTier;
}

export interface TierAllocation {
  tier: Exclude<StrategyTier, "avoid">;
  targetPct: number;
  actualPct: number;
  /** Relative drift from target: (actual - target) / target. */
  relativeDrift: number | null;
  outsideBand: boolean;
}

export interface RebalanceSuggestion {
  action: "trim" | "add";
  tier: string;
  detail: string;
}

export interface PortfolioAnalysis {
  totalValueUsd: number;
  positions: PositionValue[];
  tiers: TierAllocation[];
  suggestions: RebalanceSuggestion[];
  unpriced: string[];
}

export function analyzePortfolio(
  positions: Position[],
  quotes: PriceQuote[],
  tierByAsset: Record<string, StrategyTier | undefined>,
  profile: RiskProfile,
): PortfolioAnalysis {
  const quoteById = new Map(quotes.map((q) => [q.id, q]));
  const valued: PositionValue[] = positions.map((p) => {
    const q = quoteById.get(p.assetId);
    const valueUsd = q?.priceUsd != null ? q.priceUsd * p.quantity : null;
    // Unclassified holdings are treated as speculative until a report grades them.
    const tier = tierByAsset[p.assetId] ?? "speculative";
    return { ...p, valueUsd, tier };
  });

  const totalValueUsd = valued.reduce((a, p) => a + (p.valueUsd ?? 0), 0);
  const template = ALLOCATION_TEMPLATES[profile];
  const tierKeys = ["core", "quality", "speculative"] as const;

  const tiers: TierAllocation[] = tierKeys.map((tier) => {
    const actual = valued
      .filter((p) => (p.tier === "avoid" ? "speculative" : p.tier) === tier)
      .reduce((a, p) => a + (p.valueUsd ?? 0), 0);
    const actualPct = totalValueUsd > 0 ? (actual / totalValueUsd) * 100 : 0;
    const targetPct = template[tier] * 100;
    const relativeDrift = targetPct > 0 ? (actualPct - targetPct) / targetPct : null;
    return {
      tier,
      targetPct,
      actualPct: Math.round(actualPct * 10) / 10,
      relativeDrift:
        relativeDrift === null ? null : Math.round(relativeDrift * 1000) / 1000,
      outsideBand:
        relativeDrift !== null && Math.abs(relativeDrift) > REBALANCE_DRIFT_BAND,
    };
  });

  const suggestions: RebalanceSuggestion[] = [];
  for (const t of tiers) {
    if (!t.outsideBand || totalValueUsd === 0) continue;
    const diffUsd = ((t.actualPct - t.targetPct) / 100) * totalValueUsd;
    if (diffUsd > 0) {
      suggestions.push({
        action: "trim",
        tier: t.tier,
        detail: `${t.tier} tier is ${t.actualPct.toFixed(1)}% vs ${t.targetPct.toFixed(0)}% target: trim about $${Math.abs(diffUsd).toFixed(0)}${t.tier === "speculative" ? " and harvest into core" : ""}`,
      });
    } else {
      suggestions.push({
        action: "add",
        tier: t.tier,
        detail: `${t.tier} tier is ${t.actualPct.toFixed(1)}% vs ${t.targetPct.toFixed(0)}% target: add about $${Math.abs(diffUsd).toFixed(0)}`,
      });
    }
  }

  // Per position cap check inside alt tiers.
  for (const p of valued) {
    if (p.tier !== "quality" && p.tier !== "speculative") continue;
    if (p.valueUsd === null || totalValueUsd === 0) continue;
    const pct = (p.valueUsd / totalValueUsd) * 100;
    if (pct > MAX_SINGLE_ALT_PCT) {
      suggestions.push({
        action: "trim",
        tier: p.tier,
        detail: `${p.symbol} is ${pct.toFixed(1)}% of the portfolio, above the ${MAX_SINGLE_ALT_PCT}% single-alt cap`,
      });
    }
  }

  return {
    totalValueUsd,
    positions: valued,
    tiers,
    suggestions,
    unpriced: valued.filter((p) => p.valueUsd === null).map((p) => p.symbol),
  };
}
