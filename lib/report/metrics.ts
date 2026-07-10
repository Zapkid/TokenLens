// Builds the defined metric catalog for a report from raw provider data.
// Percentiles are computed against the peer cohort fetched at generation time.

import {
  annualizedVol,
  correlation,
  downsideDeviation,
  log10Safe,
  logReturns,
  maxDrawdown,
  percentileOf,
  sharpeRatio,
  simpleMovingAverage,
  trailingReturn,
} from "../math";
import type { Metric, SeriesPoint } from "../types";
import type { CohortRaw, RawChainData, RawTokenData } from "../providers/types";

function logPercentile(value: number | null, cohortValues: (number | null)[]): number | null {
  if (value === null) return null;
  const lv = log10Safe(value);
  if (lv === null) return null;
  const cohort = cohortValues
    .map((x) => (x !== null ? log10Safe(x) : null))
    .filter((x): x is number => x !== null);
  return percentileOf(lv, cohort);
}

function plainPercentile(value: number | null, cohortValues: (number | null)[]): number | null {
  if (value === null) return null;
  const cohort = cohortValues.filter((x): x is number => x !== null);
  return percentileOf(value, cohort);
}

export function closesOf(series: SeriesPoint[]): number[] {
  return series.map((p) => p.v);
}

/** Percentile of the current value within the asset's own trailing history. */
export function percentileInOwnHistory(series: SeriesPoint[]): number | null {
  if (series.length < 180) return null;
  const closes = closesOf(series);
  const current = closes[closes.length - 1];
  return percentileOf(current, closes);
}

export function buildTokenMetrics(
  raw: RawTokenData,
  cohort: CohortRaw,
  btcCloses: SeriesPoint[],
): Metric[] {
  const closes = closesOf(raw.dailyCloses);
  const metrics: Metric[] = [];
  const peers = cohort.peers;

  const mcFdv =
    raw.marketCap !== null && raw.fdv !== null && raw.fdv > 0
      ? raw.marketCap / raw.fdv
      : null;
  const turnover =
    raw.volume24h !== null && raw.marketCap !== null && raw.marketCap > 0
      ? raw.volume24h / raw.marketCap
      : null;
  const athDistance =
    raw.priceUsd !== null && raw.athUsd !== null && raw.athUsd > 0
      ? raw.priceUsd / raw.athUsd - 1
      : null;

  // Market family
  metrics.push(
    {
      key: "price",
      label: "Price",
      family: "market",
      value: raw.priceUsd,
      format: "usd",
      direction: "neutral",
      percentile: null,
    },
    {
      key: "marketCap",
      label: "Market cap",
      family: "market",
      value: raw.marketCap,
      format: "usdCompact",
      direction: "higher",
      percentile: logPercentile(raw.marketCap, peers.map((p) => p.marketCap)),
    },
    {
      key: "fdv",
      label: "Fully diluted valuation",
      family: "market",
      value: raw.fdv,
      format: "usdCompact",
      direction: "neutral",
      percentile: null,
    },
    {
      key: "mcFdv",
      label: "MC / FDV",
      family: "market",
      value: mcFdv,
      format: "ratio",
      direction: "higher",
      percentile: plainPercentile(
        mcFdv,
        peers.map((p) =>
          p.marketCap !== null && p.fdv !== null && p.fdv > 0
            ? p.marketCap / p.fdv
            : null,
        ),
      ),
      note: "Low values signal future dilution",
    },
    {
      key: "volume24h",
      label: "24h volume",
      family: "market",
      value: raw.volume24h,
      format: "usdCompact",
      direction: "higher",
      percentile: logPercentile(raw.volume24h, peers.map((p) => p.volume24h)),
    },
    {
      key: "turnover",
      label: "Volume / MC turnover",
      family: "market",
      value: turnover,
      format: "ratio",
      direction: "higher",
      percentile: plainPercentile(
        turnover,
        peers.map((p) =>
          p.volume24h !== null && p.marketCap !== null && p.marketCap > 0
            ? p.volume24h / p.marketCap
            : null,
        ),
      ),
      note: "Liquidity proxy",
    },
    {
      key: "athDistance",
      label: "Distance from ATH",
      family: "market",
      value: athDistance,
      format: "pct",
      direction: "neutral",
      percentile: plainPercentile(
        athDistance !== null ? athDistance * 100 : null,
        peers.map((p) => p.athChangePct),
      ),
    },
  );

  for (const [days, label] of [
    [7, "7d return"],
    [30, "30d return"],
    [90, "90d return"],
    [365, "365d return"],
  ] as const) {
    const r = trailingReturn(closes, days);
    metrics.push({
      key: `return${days}d`,
      label,
      family: "market",
      value: r,
      format: "pct",
      direction: "higher",
      percentile:
        days === 90
          ? plainPercentile(
              r !== null ? r * 100 : null,
              peers.map((p) => p.return90dPct),
            )
          : null,
    });
  }

  // Supply and tokenomics family
  const dilutionOverhang = mcFdv !== null ? 1 - mcFdv : null;
  metrics.push(
    {
      key: "circulatingSupply",
      label: "Circulating supply",
      family: "supply",
      value: raw.circulatingSupply,
      format: "number",
      direction: "neutral",
      percentile: null,
    },
    {
      key: "maxSupply",
      label: "Max supply",
      family: "supply",
      value: raw.maxSupply,
      format: "number",
      direction: "neutral",
      percentile: null,
      note: raw.maxSupply === null ? "No max supply cap" : undefined,
    },
    {
      key: "dilutionOverhang",
      label: "Dilution overhang (1 - MC/FDV)",
      family: "supply",
      value: dilutionOverhang,
      format: "pct",
      direction: "lower",
      percentile: null,
      note: "Approximation of unlock overhang. Verified unlock schedules are not wired in this build.",
    },
  );

  // Development family (absolute levels; cohort dev data is not fetched)
  if (raw.devActivity) {
    metrics.push(
      {
        key: "commits4w",
        label: "Commits (4 weeks)",
        family: "development",
        value: raw.devActivity.commits4w,
        format: "number",
        direction: "higher",
        percentile: null,
      },
      {
        key: "contributors",
        label: "PR contributors",
        family: "development",
        value: raw.devActivity.contributors,
        format: "number",
        direction: "higher",
        percentile: null,
      },
    );
  }

  // Price behavior family
  const vol30 = annualizedVol(closes, 30);
  const vol90 = annualizedVol(closes, 90);
  const dd = maxDrawdown(closes.slice(-365));
  const sharpe = sharpeRatio(closes, 365);
  const downside = downsideDeviation(closes, 365);
  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const price = closes[closes.length - 1] ?? null;
  const trendStructure =
    price !== null && sma50 !== null && sma200 !== null
      ? price > sma50 && sma50 > sma200
        ? 1
        : price < sma50 && sma50 < sma200
          ? -1
          : 0
      : null;
  const corrBtc = correlation(
    logReturns(closes.slice(-365)),
    logReturns(closesOf(btcCloses).slice(-365)),
  );

  metrics.push(
    {
      key: "vol30",
      label: "30d realized volatility (ann.)",
      family: "priceBehavior",
      value: vol30,
      format: "pct",
      direction: "lower",
      percentile: null,
    },
    {
      key: "vol90",
      label: "90d realized volatility (ann.)",
      family: "priceBehavior",
      value: vol90,
      format: "pct",
      direction: "lower",
      percentile: null,
    },
    {
      key: "maxDrawdown1y",
      label: "Max drawdown (1y)",
      family: "priceBehavior",
      value: dd,
      format: "pct",
      direction: "higher",
      percentile: null,
    },
    {
      key: "downsideDeviation",
      label: "Downside deviation (ann.)",
      family: "priceBehavior",
      value: downside,
      format: "pct",
      direction: "lower",
      percentile: null,
    },
    {
      key: "sharpe1y",
      label: "Risk-adjusted return (1y)",
      family: "priceBehavior",
      value: sharpe,
      format: "ratio",
      direction: "higher",
      percentile: null,
    },
    {
      key: "trendStructure",
      label: "50/200d trend structure",
      family: "priceBehavior",
      value: trendStructure,
      format: "ratio",
      direction: "higher",
      percentile: null,
      note:
        trendStructure === 1
          ? "Uptrend: price above 50d, 50d above 200d"
          : trendStructure === -1
            ? "Downtrend: price below 50d, 50d below 200d"
            : "Mixed trend structure",
    },
    {
      key: "corrBtc",
      label: "Correlation vs BTC (1y)",
      family: "priceBehavior",
      value: corrBtc,
      format: "ratio",
      direction: "neutral",
      percentile: null,
    },
  );

  return metrics;
}

export function buildNetworkMetrics(raw: RawChainData): Metric[] {
  const metrics: Metric[] = [];
  const chainTvls = raw.allChains.map((c) => c.tvl);
  const tvlHistoryCloses = closesOf(raw.tvlHistory);
  const tvlChange90d = trailingReturn(tvlHistoryCloses, 90);
  const topShare =
    raw.protocols.length > 0 && raw.tvl && raw.tvl > 0
      ? raw.protocols[0].tvl / raw.tvl
      : null;
  const nativeMc = raw.nativeToken?.marketCap ?? null;
  const mcTvl =
    nativeMc !== null && raw.tvl !== null && raw.tvl > 0 ? nativeMc / raw.tvl : null;

  metrics.push(
    {
      key: "chainTvl",
      label: "Chain TVL",
      family: "network",
      value: raw.tvl,
      format: "usdCompact",
      direction: "higher",
      percentile: logPercentile(raw.tvl, chainTvls),
    },
    {
      key: "tvlChange90d",
      label: "TVL change (90d)",
      family: "network",
      value: tvlChange90d,
      format: "pct",
      direction: "higher",
      percentile: null,
    },
    {
      key: "chainFees24h",
      label: "Chain fees (24h)",
      family: "network",
      value: raw.fees24h,
      format: "usdCompact",
      direction: "higher",
      percentile: null,
    },
    {
      key: "chainRevenue24h",
      label: "Chain revenue (24h)",
      family: "network",
      value: raw.revenue24h,
      format: "usdCompact",
      direction: "higher",
      percentile: null,
    },
    {
      key: "mcTvl",
      label: "Native token MC / TVL",
      family: "network",
      value: mcTvl,
      format: "ratio",
      direction: "lower",
      percentile: null,
      note: "Rough price to book analog for chains",
    },
    {
      key: "stablecoinSupply",
      label: "Stablecoin supply on chain",
      family: "network",
      value: raw.stablecoinSupplyUsd,
      format: "usdCompact",
      direction: "higher",
      percentile: null,
    },
    {
      key: "protocolCount",
      label: "Protocols with TVL",
      family: "network",
      value: raw.protocols.length || null,
      format: "number",
      direction: "higher",
      percentile: null,
    },
    {
      key: "topProtocolShare",
      label: "Top protocol share of TVL",
      family: "network",
      value: topShare,
      format: "pct",
      direction: "lower",
      percentile: null,
      note: "Concentration: is the chain one app or an ecosystem",
    },
  );

  return metrics;
}
