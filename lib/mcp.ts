// Pure projections for the MCP connector. Each function shapes domain
// objects into compact, LLM-friendly JSON: scores, verdicts, and honesty
// markers, without chart series or UI-oriented payloads. Kept free of
// transport concerns so the projections are unit-testable like the rest
// of lib/.

import type { PortfolioAnalysis } from "./report/strategy";
import type {
  AssetRef,
  PillarScore,
  PriceQuote,
  RegimeSnapshot,
  Report,
  RiskProfile,
  ScenarioHorizon,
  Trajectory,
} from "./types";

interface PillarSummary {
  key: string;
  label: string;
  /** 0 to 100, or null when the pillar had no usable inputs. */
  score: number | null;
  inputs: string[];
}

function summarizePillars(pillars: PillarScore[]): PillarSummary[] {
  return pillars.map((p) => ({
    key: p.key,
    label: p.label,
    score: p.score === null ? null : Math.round(p.score * 10) / 10,
    inputs: p.inputs.map((i) => `${i.label}: ${i.detail}`),
  }));
}

export interface MetricSummary {
  key: string;
  label: string;
  value: number | null;
  format: string;
  /** Cohort percentile, 0 to 100, before direction is applied. */
  percentile: number | null;
  note?: string;
}

export interface RegimeSummary {
  state: string;
  /** -1 (bearish) to 1 (bullish) composite. */
  score: number;
  components: { label: string; value: string; signal: number }[];
  fearGreed: { value: number; label: string } | null;
  totalMarketCapUsd: number | null;
  asOf: string;
}

export function summarizeRegime(regime: RegimeSnapshot): RegimeSummary {
  return {
    state: regime.state,
    score: Math.round(regime.score * 100) / 100,
    components: regime.components,
    fearGreed: regime.fearGreed,
    totalMarketCapUsd: regime.totalMarketCapUsd,
    asOf: regime.asOf,
  };
}

export interface HorizonSummary {
  horizonMonths: number;
  summary: string;
  expectedRange: { low: number; high: number };
  scenarios: {
    key: string;
    probability: number;
    range: { low: number; high: number };
    narrative: string;
  }[];
}

function summarizeHorizons(horizons: ScenarioHorizon[]): HorizonSummary[] {
  return horizons.map((h) => ({
    horizonMonths: h.horizonMonths,
    summary: h.summary,
    expectedRange: { low: h.expectedLow, high: h.expectedHigh },
    scenarios: h.scenarios.map((s) => ({
      key: s.key,
      probability: s.probability,
      range: { low: s.low, high: s.high },
      narrative: s.narrative,
    })),
  }));
}

export interface TrajectorySummary {
  kind: "price" | "tvl";
  current: number | null;
  annualizedVol: number | null;
  insufficientHistory: boolean;
  /** Visible probability modifiers so the model can explain the numbers. */
  modifiers: { label: string; effect: string; note: string }[];
  horizons: HorizonSummary[];
}

export function summarizeTrajectory(trajectory: Trajectory): TrajectorySummary {
  return {
    kind: trajectory.kind,
    current: trajectory.current,
    annualizedVol: trajectory.annualizedVol,
    insufficientHistory: trajectory.insufficientHistory,
    modifiers: trajectory.modifiers.map((m) => ({
      label: m.label,
      effect: m.effect,
      note: m.note,
    })),
    horizons: summarizeHorizons(trajectory.horizons),
  };
}

export interface ReportSummary {
  asset: {
    id: string;
    type: string;
    name: string;
    symbol: string;
    marketCapRank: number | null;
  };
  dataMode: string;
  generatedAt: string;
  scores: {
    opportunity: number;
    risk: number;
    overall: number;
    riskGrade: string;
    quadrant: string;
    riskProfile: string;
  };
  opportunityPillars: PillarSummary[];
  riskPillars: PillarSummary[];
  riskReasons: string[];
  metrics: MetricSummary[];
  cohort: { label: string; size: number };
  regime: RegimeSummary;
  strategy: {
    tier: string;
    tierLabel: string;
    rationale: string;
    maxPositionPct: number;
    dcaWeeks: number;
    dcaNote: string;
    exitLadder: { trigger: string; action: string }[];
    reviewTriggers: string[];
  };
  network?: {
    tvl: number | null;
    tvlChange90dPct: number | null;
    fees24hUsd: number | null;
    revenue24hUsd: number | null;
    stablecoinSupplyUsd: number | null;
    protocolCount: number | null;
    topProtocolSharePct: number | null;
    topProtocols: { name: string; category: string; tvl: number }[];
  };
  upcomingEvents: {
    date: string;
    type: string;
    title: string;
    impact: string;
    note?: string;
  }[];
  warnings: string[];
  disclaimer: string;
}

export const MCP_DISCLAIMER =
  "TokenLens scores are derived from public market data and peer-cohort " +
  "percentiles. They are decision support for a personal research tool, " +
  "not financial advice. Null pillars mean no usable data, never neutrality.";

/**
 * Project a full report into the compact JSON an LLM needs: identity,
 * scores, pillar breakdowns with their inputs, cohort context, regime,
 * strategy framework, and the honesty markers (warnings, null pillars).
 * Chart series (price history, TVL history, cohort scatter) are dropped.
 */
export function summarizeReportForLlm(report: Report): ReportSummary {
  return {
    asset: {
      id: report.asset.id,
      type: report.asset.type,
      name: report.asset.name,
      symbol: report.asset.symbol,
      marketCapRank: report.asset.marketCapRank ?? null,
    },
    dataMode: report.dataMode,
    generatedAt: report.generatedAt,
    scores: report.scores,
    opportunityPillars: summarizePillars(report.opportunityPillars),
    riskPillars: summarizePillars(report.riskPillars),
    riskReasons: report.riskReasons,
    metrics: report.metrics.map((m) => ({
      key: m.key,
      label: m.label,
      value: m.value,
      format: m.format,
      percentile: m.percentile,
      ...(m.note ? { note: m.note } : {}),
    })),
    cohort: { label: report.cohort.label, size: report.cohort.size },
    regime: summarizeRegime(report.regime),
    strategy: report.strategy,
    ...(report.network
      ? {
          network: {
            tvl: report.network.tvl,
            tvlChange90dPct: report.network.tvlChange90dPct,
            fees24hUsd: report.network.fees24hUsd,
            revenue24hUsd: report.network.revenue24hUsd,
            stablecoinSupplyUsd: report.network.stablecoinSupplyUsd,
            protocolCount: report.network.protocolCount,
            topProtocolSharePct: report.network.topProtocolSharePct,
            topProtocols: report.network.topProtocols,
          },
        }
      : {}),
    upcomingEvents: report.events.map((e) => ({
      date: e.date,
      type: e.type,
      title: e.title,
      impact: e.impact,
      ...(e.note ? { note: e.note } : {}),
    })),
    warnings: report.warnings,
    disclaimer: MCP_DISCLAIMER,
  };
}

export interface ScenarioAnswer {
  asset: { id: string; type: string; name: string; symbol: string };
  dataMode: string;
  generatedAt: string;
  price: TrajectorySummary;
  tvl?: TrajectorySummary;
  regimeState: string;
  warnings: string[];
  disclaimer: string;
}

/** The trajectory slice of a report: price scenarios, TVL scenarios when present. */
export function summarizeScenarios(report: Report): ScenarioAnswer {
  return {
    asset: {
      id: report.asset.id,
      type: report.asset.type,
      name: report.asset.name,
      symbol: report.asset.symbol,
    },
    dataMode: report.dataMode,
    generatedAt: report.generatedAt,
    price: summarizeTrajectory(report.trajectory),
    ...(report.tvlTrajectory
      ? { tvl: summarizeTrajectory(report.tvlTrajectory) }
      : {}),
    regimeState: report.regime.state,
    warnings: report.warnings,
    disclaimer: MCP_DISCLAIMER,
  };
}

export interface ComparisonSummary {
  assets: ReportSummary["asset"][];
  scores: Record<
    string,
    { opportunity: number; risk: number; overall: number; riskGrade: string; quadrant: string }
  >;
  /** Pillar-by-pillar scores keyed by asset id; null means no usable data. */
  opportunityPillars: { key: string; label: string; scores: Record<string, number | null> }[];
  riskPillars: { key: string; label: string; scores: Record<string, number | null> }[];
  strategyTiers: Record<string, string>;
  dataMode: string;
  warnings: Record<string, string[]>;
  disclaimer: string;
}

export interface PortfolioSummary {
  totalValueUsd: number;
  totalCostBasisUsd: number;
  totalPnlUsd: number | null;
  riskProfile: string;
  positions: {
    assetId: string;
    assetType: string;
    name: string;
    symbol: string;
    quantity: number;
    costBasisUsd: number;
    valueUsd: number | null;
    pnlUsd: number | null;
    pnlPct: number | null;
    change24hPct: number | null;
    tier: string;
  }[];
  tierAllocation: {
    tier: string;
    targetPct: number;
    actualPct: number;
    relativeDrift: number | null;
    outsideBand: boolean;
  }[];
  rebalanceSuggestions: { action: string; tier: string; detail: string }[];
  /** Symbols whose value is unknown because no price resolved. */
  unpricedSymbols: string[];
  disclaimer: string;
}

/**
 * Project the tested portfolio analysis into an LLM answer, adding per
 * position and total P&L. Unpriced positions keep null values rather than
 * pretending a zero.
 */
export function summarizePortfolio(
  analysis: PortfolioAnalysis,
  quotes: PriceQuote[],
  riskProfile: RiskProfile,
): PortfolioSummary {
  const quoteById = new Map(quotes.map((q) => [q.id, q]));
  const positions = analysis.positions.map((p) => {
    const pnlUsd = p.valueUsd === null ? null : p.valueUsd - p.costBasisUsd;
    return {
      assetId: p.assetId,
      assetType: p.assetType,
      name: p.name,
      symbol: p.symbol,
      quantity: p.quantity,
      costBasisUsd: p.costBasisUsd,
      valueUsd: p.valueUsd,
      pnlUsd,
      pnlPct:
        pnlUsd === null || p.costBasisUsd <= 0
          ? null
          : Math.round((pnlUsd / p.costBasisUsd) * 1000) / 10,
      change24hPct: quoteById.get(p.assetId)?.change24hPct ?? null,
      tier: p.tier,
    };
  });
  const allPriced = positions.every((p) => p.valueUsd !== null);
  const totalCostBasisUsd = positions.reduce((sum, p) => sum + p.costBasisUsd, 0);
  return {
    totalValueUsd: analysis.totalValueUsd,
    totalCostBasisUsd,
    totalPnlUsd: allPriced ? analysis.totalValueUsd - totalCostBasisUsd : null,
    riskProfile,
    positions,
    tierAllocation: analysis.tiers,
    rebalanceSuggestions: analysis.suggestions,
    unpricedSymbols: analysis.unpriced,
    disclaimer: MCP_DISCLAIMER,
  };
}

export interface WatchlistSummary {
  watchlist: {
    id: string;
    type: string;
    name: string;
    symbol: string;
    priceUsd: number | null;
    change24hPct: number | null;
  }[];
}

/** Watchlist entries joined with current quotes when available. */
export function summarizeWatchlist(
  watchlist: AssetRef[],
  quotes: PriceQuote[],
): WatchlistSummary {
  const quoteById = new Map(quotes.map((q) => [q.id, q]));
  return {
    watchlist: watchlist.map((a) => ({
      id: a.id,
      type: a.type,
      name: a.name,
      symbol: a.symbol,
      priceUsd: quoteById.get(a.id)?.priceUsd ?? null,
      change24hPct: quoteById.get(a.id)?.change24hPct ?? null,
    })),
  };
}

function pillarMatrix(
  reports: Report[],
  pick: (r: Report) => PillarScore[],
): ComparisonSummary["opportunityPillars"] {
  const first = pick(reports[0]);
  return first.map((pillar) => {
    const scores: Record<string, number | null> = {};
    for (const r of reports) {
      const match = pick(r).find((p) => p.key === pillar.key);
      const s = match?.score ?? null;
      scores[r.asset.id] = s === null ? null : Math.round(s * 10) / 10;
    }
    return { key: pillar.key, label: pillar.label, scores };
  });
}

/** Side-by-side comparison of two or more reports for LLM consumption. */
export function summarizeComparison(reports: Report[]): ComparisonSummary {
  const scores: ComparisonSummary["scores"] = {};
  const strategyTiers: Record<string, string> = {};
  const warnings: Record<string, string[]> = {};
  for (const r of reports) {
    scores[r.asset.id] = {
      opportunity: r.scores.opportunity,
      risk: r.scores.risk,
      overall: r.scores.overall,
      riskGrade: r.scores.riskGrade,
      quadrant: r.scores.quadrant,
    };
    strategyTiers[r.asset.id] = r.strategy.tierLabel;
    warnings[r.asset.id] = r.warnings;
  }
  return {
    assets: reports.map((r) => ({
      id: r.asset.id,
      type: r.asset.type,
      name: r.asset.name,
      symbol: r.asset.symbol,
      marketCapRank: r.asset.marketCapRank ?? null,
    })),
    scores,
    opportunityPillars: pillarMatrix(reports, (r) => r.opportunityPillars),
    riskPillars: pillarMatrix(reports, (r) => r.riskPillars),
    strategyTiers,
    dataMode: reports[0]?.dataMode ?? "live",
    warnings,
    disclaimer: MCP_DISCLAIMER,
  };
}
