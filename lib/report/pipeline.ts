// Report generation pipeline. One engine for both paths: on-demand lookups
// and the pre-generated library both call generateReport; the library is a
// cache of what the on-demand engine would produce anyway.

import { cacheDelete, cached } from "../cache";
import { DEFAULT_WEIGHTS, REPORT_TTL_MS, WEIGHTS_VERSION } from "../constants";
import { percentileOf } from "../math";
import { currentDataMode, getProvider } from "../providers";
import type { RawChainData, RawTokenData } from "../providers/types";
import type {
  AssetType,
  CohortSnapshot,
  Metric,
  NetworkSection,
  Report,
  SeriesPoint,
} from "../types";
import { buildEvents } from "./events";
import {
  buildNetworkMetrics,
  buildTokenMetrics,
  percentileInOwnHistory,
} from "./metrics";
import { computeRegime } from "./regime";
import {
  buildOpportunityPillars,
  buildRiskPillars,
  computeScores,
  riskReasons,
  type ScoringContext,
} from "./scoring";
import { buildStrategyGuidance } from "./strategy";
import { computeTrajectory, type TrajectoryContext } from "./trajectory";

function ageDaysOf(genesisDate: string | null, closes: SeriesPoint[]): number | null {
  if (genesisDate) {
    const ms = Date.now() - new Date(genesisDate).getTime();
    if (Number.isFinite(ms) && ms > 0) return ms / (24 * 60 * 60 * 1000);
  }
  return closes.length > 30 ? closes.length : null;
}

function downsample(series: SeriesPoint[], maxPoints = 400): SeriesPoint[] {
  if (series.length <= maxPoints) return series;
  const step = series.length / maxPoints;
  const out: SeriesPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(series[Math.floor(i * step)]);
  }
  out[out.length - 1] = series[series.length - 1];
  return out;
}

async function generateFresh(type: AssetType, id: string): Promise<Report> {
  const provider = getProvider();
  const warnings: string[] = [];

  const [marketSnapshot, tokenRaw, chainRaw] = await Promise.all([
    provider.getMarketSnapshot(),
    type === "token" ? provider.getTokenData(id) : Promise.resolve(null),
    type === "chain" ? provider.getChainData(id) : Promise.resolve(null),
  ]);

  const regime = computeRegime(marketSnapshot);

  // A chain report is the native token analysis plus the network layer.
  const native: RawTokenData | null =
    type === "token" ? tokenRaw : (chainRaw?.nativeToken ?? null);
  const chain: RawChainData | null = chainRaw;

  if (type === "chain" && !native) {
    warnings.push(
      "This chain has no resolvable native token; token-level metrics and the price trajectory are omitted.",
    );
  }

  const cohortRaw = native
    ? await provider.getCohort(native.ref.id, native.marketCap)
    : { label: "No token cohort", peers: [] };

  const metrics: Metric[] = [];
  if (native) {
    metrics.push(...buildTokenMetrics(native, cohortRaw, marketSnapshot.btcCloses));
  }
  let network: NetworkSection | undefined;
  if (chain) {
    metrics.push(...buildNetworkMetrics(chain));
    const topShare =
      chain.protocols.length > 0 && chain.tvl && chain.tvl > 0
        ? (chain.protocols[0].tvl / chain.tvl) * 100
        : null;
    network = {
      tvl: chain.tvl,
      tvlChange90dPct:
        (metrics.find((m) => m.key === "tvlChange90d")?.value ?? null) !== null
          ? (metrics.find((m) => m.key === "tvlChange90d")!.value as number) * 100
          : null,
      fees24hUsd: chain.fees24h,
      revenue24hUsd: chain.revenue24h,
      stablecoinSupplyUsd: chain.stablecoinSupplyUsd,
      protocolCount: chain.protocols.length || null,
      topProtocolSharePct: topShare,
      topProtocols: chain.protocols.slice(0, 8),
      tvlHistory: downsample(chain.tvlHistory),
    };
  }

  const priceHistory = native ? native.dailyCloses : [];
  const ownHistoryPercentile = native
    ? percentileInOwnHistory(native.dailyCloses)
    : null;
  const mcFdvRatio =
    native && native.marketCap !== null && native.fdv !== null && native.fdv > 0
      ? native.marketCap / native.fdv
      : null;

  const ctx: ScoringContext = {
    ownHistoryPercentile,
    assetAgeDays: native ? ageDaysOf(native.genesisDate, native.dailyCloses) : null,
    marketCapRank: native?.ref.marketCapRank ?? null,
    isChain: type === "chain",
  };

  const opportunityPillars = buildOpportunityPillars(metrics, ctx);
  const riskPillars = buildRiskPillars(metrics, ctx);
  const scores = computeScores(
    opportunityPillars,
    riskPillars,
    DEFAULT_WEIGHTS,
    "balanced",
  );

  const asset = type === "chain" && chain ? chain.ref : native!.ref;
  const events = buildEvents(asset, { mcFdvRatio });

  const trendStructure =
    (metrics.find((m) => m.key === "trendStructure")?.value as number | null) ?? null;
  const trajectoryCtx: TrajectoryContext = {
    regimeState: regime.state,
    ownHistoryPercentile,
    mcFdvRatio,
    trendStructure,
    events,
  };

  const trajectory = computeTrajectory("price", priceHistory, trajectoryCtx);
  if (trajectory.insufficientHistory && native) {
    warnings.push(
      "Insufficient price history for the trajectory model. Ranges require at least 180 daily closes.",
    );
  }

  let tvlTrajectory;
  if (chain && chain.tvlHistory.length > 0) {
    tvlTrajectory = computeTrajectory("tvl", chain.tvlHistory, {
      ...trajectoryCtx,
      mcFdvRatio: null,
    });
  }

  if (!native?.devActivity?.commits4w) {
    warnings.push(
      "Developer activity data was unavailable for this asset; the development pillar may be thin.",
    );
  }

  const cohort: CohortSnapshot = {
    label: cohortRaw.label,
    size: cohortRaw.peers.length,
    peers: cohortRaw.peers.slice(0, 60).map((p) => {
      const mcs = cohortRaw.peers
        .map((x) => x.marketCap)
        .filter((x): x is number => x !== null);
      const rets = cohortRaw.peers
        .map((x) => x.return90dPct)
        .filter((x): x is number => x !== null);
      return {
        id: p.id,
        name: p.name,
        symbol: p.symbol,
        marketCap: p.marketCap,
        // Labeled proxies for the quadrant scatter: smaller cap reads riskier,
        // stronger 90d return reads as more near-term opportunity.
        riskProxy:
          p.marketCap !== null ? 100 - (percentileOf(p.marketCap, mcs) ?? 50) : null,
        opportunityProxy:
          p.return90dPct !== null ? (percentileOf(p.return90dPct, rets) ?? 50) : null,
      };
    }),
  };

  const now = Date.now();
  return {
    schemaVersion: 1,
    asset,
    dataMode: currentDataMode(),
    generatedAt: new Date(now).toISOString(),
    ttlExpiresAt: new Date(now + REPORT_TTL_MS).toISOString(),
    weightsVersion: WEIGHTS_VERSION,
    reviewTier: "auto-baseline",
    priceHistory: downsample(priceHistory),
    metrics,
    cohort,
    opportunityPillars,
    riskPillars,
    scores,
    riskReasons: riskReasons(riskPillars),
    trajectory,
    tvlTrajectory,
    network,
    events,
    regime,
    strategy: buildStrategyGuidance(asset.id, scores, regime.state),
    warnings,
  };
}

export async function generateReport(
  type: AssetType,
  id: string,
  opts: { refresh?: boolean } = {},
): Promise<Report> {
  const key = `report:${type}:${id}:${currentDataMode()}`;
  if (opts.refresh) cacheDelete(key);
  return cached(key, REPORT_TTL_MS, () => generateFresh(type, id));
}
