// Pre-fills checklist items from the metrics a report already carries. Pure
// functions over the Report payload: the server never runs this, the client
// derives auto answers at render time so a refreshed report updates them.

import { formatCompactUsd, formatMetric, formatNumber, formatPct } from "../format";
import { clamp } from "../math";
import { bandScore } from "../report/scoring";
import type { Metric, Report } from "../types";
import type { AutoAnswer, ChecklistScore } from "./checklist";

function metricOf(report: Report, key: string): Metric | undefined {
  return report.metrics.find((m) => m.key === key);
}

/** Collapse a 0-100 band score onto the checklist's 1-5 scale. */
export function toFiveScale(score: number | null): ChecklistScore | null {
  if (score === null || !Number.isFinite(score)) return null;
  return clamp(Math.round(1 + score / 25), 1, 5) as ChecklistScore;
}

function fromBands(
  value: number | null,
  anchors: [number, number][],
): ChecklistScore | null {
  return toFiveScale(bandScore(value, anchors));
}

/**
 * Auto answers keyed by checklist item key. Items whose source metric is
 * missing are simply absent and stay manual.
 */
export function buildAutoAnswers(report: Report): Record<string, AutoAnswer> {
  const out: Record<string, AutoAnswer> = {};
  const put = (key: string, answer: AutoAnswer | null) => {
    if (answer) out[key] = answer;
  };

  const marketCap = metricOf(report, "marketCap");
  put(
    "marketCap",
    marketCap && marketCap.value !== null
      ? {
          display: formatCompactUsd(marketCap.value),
          suggested:
            marketCap.percentile !== null ? toFiveScale(marketCap.percentile) : null,
          basis:
            marketCap.percentile !== null
              ? `Cohort percentile ${Math.round(marketCap.percentile)}`
              : "From the report metrics",
        }
      : null,
  );

  put("ticker", {
    display: report.asset.symbol || report.asset.name,
    suggested: null,
    basis: "From the asset identity",
  });

  const circulating = metricOf(report, "circulatingSupply");
  put(
    "circulatingSupply",
    circulating && circulating.value !== null
      ? {
          display: formatNumber(circulating.value),
          suggested: null,
          basis: "From the report metrics",
        }
      : null,
  );

  const maxSupply = metricOf(report, "maxSupply");
  if (maxSupply) {
    const capped = maxSupply.value !== null;
    put("maxSupply", {
      display: capped ? formatNumber(maxSupply.value) : "No max supply cap",
      suggested: capped ? 4 : 3,
      basis: capped
        ? "A hard cap limits future dilution"
        : "No cap: review the issuance policy before scoring higher",
    });
  }

  const turnover = metricOf(report, "turnover");
  put(
    "volumeShare",
    turnover && turnover.value !== null
      ? {
          display: formatPct(turnover.value),
          suggested: fromBands(turnover.value, [
            [0.005, 0],
            [0.01, 25],
            [0.03, 50],
            [0.08, 75],
            [0.15, 100],
          ]),
          basis: "24h volume divided by market cap",
        }
      : null,
  );

  put("tokenOrCoin", {
    display:
      report.asset.type === "chain"
        ? "Native chain asset"
        : "Token (verify which chain it lives on)",
    suggested: null,
    basis: "From the asset type",
  });

  const ath = metricOf(report, "athDistance");
  put(
    "athDistance",
    ath && ath.value !== null
      ? {
          display: `${formatPct(ath.value)} from ATH`,
          suggested: null,
          basis: "Distance of the current price from the all time high",
        }
      : null,
  );

  const overhang = metricOf(report, "dilutionOverhang");
  put(
    "dilution",
    overhang && overhang.value !== null
      ? {
          display: `${formatPct(overhang.value)} not yet circulating`,
          suggested: fromBands(overhang.value, [
            [0, 100],
            [0.15, 75],
            [0.4, 50],
            [0.66, 25],
            [0.85, 0],
          ]),
          basis: "1 - MC/FDV, an approximation of unlock overhang",
        }
      : null,
  );

  const commits = metricOf(report, "commits4w");
  put(
    "commitActivity",
    commits && commits.value !== null
      ? {
          display: `${formatNumber(commits.value)} commits in 4 weeks`,
          suggested: fromBands(commits.value, [
            [0, 0],
            [10, 25],
            [50, 50],
            [150, 75],
            [300, 100],
          ]),
          basis: "CoinGecko developer data",
        }
      : null,
  );

  const contributors = metricOf(report, "contributors");
  put(
    "contributorCount",
    contributors && contributors.value !== null
      ? {
          display: `${formatNumber(contributors.value)} PR contributors`,
          suggested: fromBands(contributors.value, [
            [0, 0],
            [5, 25],
            [20, 50],
            [60, 75],
            [120, 100],
          ]),
          basis: "CoinGecko developer data",
        }
      : null,
  );

  const protocols = metricOf(report, "protocolCount");
  put(
    "ecosystemBreadth",
    protocols && protocols.value !== null
      ? {
          display: `${formatNumber(protocols.value)} protocols with TVL`,
          suggested: fromBands(protocols.value, [
            [3, 0],
            [20, 25],
            [60, 50],
            [150, 75],
            [400, 100],
          ]),
          basis: "DeFiLlama protocol list for the chain",
        }
      : null,
  );

  const fees = metricOf(report, "chainFees24h");
  put(
    "networkEconomics",
    fees && fees.value !== null
      ? {
          display: `${formatMetric(fees.value, "usdCompact")} fees in 24h`,
          suggested: fromBands(fees.value, [
            [1e4, 0],
            [1e5, 25],
            [1e6, 50],
            [5e6, 75],
            [1e7, 100],
          ]),
          basis: "DeFiLlama fees overview",
        }
      : null,
  );

  return out;
}
