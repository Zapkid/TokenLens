// Pure helpers for the Compare feature. Kept free of React and Recharts so
// they stay simple to unit test: recompute pillar-weighted scores for a set
// of previously saved reports under the user's live weights and risk
// profile, and shape their pillar data into Recharts-ready radar rows.

import { OPPORTUNITY_PILLAR_LABELS, RISK_PILLAR_LABELS } from "./constants";
import { computeScores } from "./report/scoring";
import type { ComputedScores, PillarScore, Report, RiskProfile, WeightSet } from "./types";

/** Stable identity for a report on the compare shelf: `${type}:${id}`. */
export function reportSeriesId(report: Report): string {
  return `${report.asset.type}:${report.asset.id}`;
}

export interface RescoredReport {
  report: Report;
  scores: ComputedScores;
}

/**
 * Recompute opportunity, risk, and overall scores for each report against
 * the given weights and risk profile. Pillar scores themselves are fixed
 * facts on the saved report; only the weighted aggregate changes here.
 */
export function rescoreAll(
  reports: Report[],
  weights: WeightSet,
  profile: RiskProfile,
): RescoredReport[] {
  return reports.map((report) => ({
    report,
    scores: computeScores(report.opportunityPillars, report.riskPillars, weights, profile),
  }));
}

/**
 * One row per pillar axis, recharts-ready. Series values are keyed by report
 * series id. A matching `${seriesId}::noData` boolean flags pillars with no
 * usable score: those render as 0 on the chart, never an invented number.
 */
export interface RadarRow {
  pillarKey: string;
  pillarLabel: string;
  [seriesKey: string]: string | number | boolean;
}

export interface RadarSeriesMeta {
  seriesId: string;
  label: string;
  color: string;
}

export interface RadarChartData {
  series: RadarSeriesMeta[];
  opportunity: RadarRow[];
  risk: RadarRow[];
}

/** Fixed series color slots per the data viz rules: 1, 2, 3, 5 (4 is skipped). */
export const RADAR_SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-5)",
];

export const MAX_COMPARE_SERIES = RADAR_SERIES_COLORS.length;

export function noDataKey(seriesId: string): string {
  return `${seriesId}::noData`;
}

function pillarRows(
  reports: Report[],
  labels: Record<string, string>,
  pick: (report: Report) => PillarScore[],
): RadarRow[] {
  const keys = Object.keys(labels);
  return keys.map((key) => {
    const row: RadarRow = { pillarKey: key, pillarLabel: labels[key] };
    for (const report of reports) {
      const seriesId = reportSeriesId(report);
      const pillar = pick(report).find((p) => p.key === key);
      const score = pillar?.score ?? null;
      row[seriesId] = score === null ? 0 : Math.round(score * 10) / 10;
      row[noDataKey(seriesId)] = score === null;
    }
    return row;
  });
}

/**
 * Build the Recharts-ready radar rows (one per pillar axis, for both the
 * opportunity and risk pillar sets) plus fixed-order series metadata (id,
 * label, color) for up to 4 selected reports. Extra reports beyond the
 * fourth are dropped rather than silently overflowing the color slots.
 */
export function buildRadarData(reports: Report[]): RadarChartData {
  const bounded = reports.slice(0, MAX_COMPARE_SERIES);
  const series: RadarSeriesMeta[] = bounded.map((report, i) => ({
    seriesId: reportSeriesId(report),
    label: `${report.asset.name} (${report.asset.symbol.toUpperCase()})`,
    color: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
  }));
  return {
    series,
    opportunity: pillarRows(
      bounded,
      OPPORTUNITY_PILLAR_LABELS as Record<string, string>,
      (r) => r.opportunityPillars,
    ),
    risk: pillarRows(
      bounded,
      RISK_PILLAR_LABELS as Record<string, string>,
      (r) => r.riskPillars,
    ),
  };
}

/** Market cap metric value for a report, or null when not present. */
export function marketCapOf(report: Report): number | null {
  return report.metrics.find((m) => m.key === "marketCap")?.value ?? null;
}
