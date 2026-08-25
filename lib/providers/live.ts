// Live provider: CoinGecko (tokens, market data), DeFiLlama (chains, TVL,
// fees, stablecoins), alternative.me (Fear and Greed). All free tiers.
// Attribution: price and market data by CoinGecko, TVL data by DeFiLlama.

import { cached } from "../cache";
import { cgApiBase, cgApiHeaders } from "./coingecko";
import { LIBRARY_TTL_MS, MARKET_TTL_MS } from "../constants";
import type {
  AssetRef,
  LibraryEntry,
  NetworkProtocol,
  PriceQuote,
  SearchResult,
  SeriesPoint,
  TrendingItem,
} from "../types";
import type {
  CohortRaw,
  DataProvider,
  MarketSnapshotRaw,
  RawChainData,
  RawChainListEntry,
  RawTokenData,
} from "./types";

const LLAMA = "https://api.llama.fi";
const STABLES = "https://stablecoins.llama.fi";
const FNG = "https://api.alternative.me/fng/?limit=1";

const STABLECOIN_IDS = new Set([
  "tether",
  "usd-coin",
  "dai",
  "ethena-usde",
  "usds",
  "first-digital-usd",
  "paypal-usd",
  "true-usd",
  "frax",
  "usdd",
]);
const WRAPPER_IDS = new Set([
  "wrapped-bitcoin",
  "staked-ether",
  "wrapped-steth",
  "wrapped-eeth",
  "weth",
  "wrapped-beacon-eth",
  "coinbase-wrapped-btc",
  "lombard-staked-btc",
]);

class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
  }
}

async function getJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    headers,
    // Route handlers run per request; rely on our own TTL cache instead.
    cache: "no-store",
  });
  if (!res.ok) throw new HttpError(res.status, url);
  return (await res.json()) as T;
}

async function cg<T>(path: string): Promise<T> {
  return getJson<T>(`${cgApiBase()}${path}`, cgApiHeaders());
}

interface CgCoinDetail {
  id: string;
  symbol: string;
  name: string;
  categories?: string[];
  genesis_date?: string | null;
  image?: { large?: string; small?: string };
  market_cap_rank?: number | null;
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    fully_diluted_valuation?: { usd?: number };
    total_volume?: { usd?: number };
    ath?: { usd?: number };
    atl?: { usd?: number };
    circulating_supply?: number | null;
    total_supply?: number | null;
    max_supply?: number | null;
  };
  developer_data?: {
    commit_count_4_weeks?: number | null;
    pull_request_contributors?: number | null;
    stars?: number | null;
  };
}

interface CgMarketRow {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number | null;
  market_cap?: number | null;
  market_cap_rank?: number | null;
  fully_diluted_valuation?: number | null;
  total_volume?: number | null;
  ath_change_percentage?: number | null;
  price_change_percentage_90d_in_currency?: number | null;
}

interface LlamaChainRow {
  name: string;
  tvl: number | null;
  gecko_id?: string | null;
  tokenSymbol?: string | null;
}

function chainSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function llamaChains(): Promise<RawChainListEntry[]> {
  return cached("llama:chains", MARKET_TTL_MS, async () => {
    const rows = await getJson<LlamaChainRow[]>(`${LLAMA}/v2/chains`);
    return rows
      .filter((r) => (r.tvl ?? 0) > 0)
      .map((r) => ({
        slug: chainSlug(r.name),
        name: r.name,
        tvl: r.tvl ?? null,
        geckoId: r.gecko_id ?? null,
        tokenSymbol: r.tokenSymbol ?? null,
      }))
      .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0));
  });
}

async function fetchTokenData(id: string): Promise<RawTokenData> {
  const detail = await cg<CgCoinDetail>(
    `/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false`,
  );
  // Free and demo CoinGecko tiers cap history at 365 days and reserve the
  // interval param for paid plans; days > 90 auto-selects daily granularity.
  const chart = await cg<{ prices: [number, number][] }>(
    `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=365`,
  );
  const md = detail.market_data ?? {};
  const dev = detail.developer_data;
  const dailyCloses: SeriesPoint[] = (chart.prices ?? []).map(([t, v]) => ({ t, v }));
  const ref: AssetRef = {
    id: detail.id,
    type: "token",
    name: detail.name,
    symbol: (detail.symbol ?? "").toUpperCase(),
    image: detail.image?.large ?? detail.image?.small ?? null,
    marketCapRank: detail.market_cap_rank ?? null,
    category: detail.categories?.[0] ?? null,
  };
  return {
    ref,
    priceUsd: md.current_price?.usd ?? null,
    marketCap: md.market_cap?.usd ?? null,
    fdv: md.fully_diluted_valuation?.usd ?? null,
    volume24h: md.total_volume?.usd ?? null,
    athUsd: md.ath?.usd ?? null,
    atlUsd: md.atl?.usd ?? null,
    circulatingSupply: md.circulating_supply ?? null,
    totalSupply: md.total_supply ?? null,
    maxSupply: md.max_supply ?? null,
    categories: detail.categories ?? [],
    genesisDate: detail.genesis_date ?? null,
    dailyCloses,
    devActivity: dev
      ? {
          commits4w: dev.commit_count_4_weeks ?? null,
          contributors: dev.pull_request_contributors ?? null,
          stars: dev.stars ?? null,
        }
      : null,
  };
}

export const liveProvider: DataProvider = {
  mode: "live",

  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];
    const [cgRes, chains] = await Promise.all([
      cg<{ coins: { id: string; name: string; symbol: string; market_cap_rank: number | null; large?: string }[] }>(
        `/search?query=${encodeURIComponent(q)}`,
      ),
      llamaChains(),
    ]);
    const tokenResults: SearchResult[] = (cgRes.coins ?? []).slice(0, 8).map((c) => ({
      id: c.id,
      type: "token",
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      image: c.large ?? null,
      marketCapRank: c.market_cap_rank,
      hint: c.market_cap_rank ? `Token, market cap rank #${c.market_cap_rank}` : "Token",
    }));
    const ql = q.toLowerCase();
    const chainResults: SearchResult[] = chains
      .filter(
        (c) =>
          c.name.toLowerCase().includes(ql) ||
          (c.tokenSymbol ?? "").toLowerCase() === ql,
      )
      .slice(0, 4)
      .map((c) => ({
        id: c.slug,
        type: "chain",
        name: c.name,
        symbol: c.tokenSymbol ?? "",
        coingeckoId: c.geckoId,
        hint: "Blockchain network",
      }));
    // Chains first when the query looks like a network name, tokens first otherwise.
    const exactChain = chainResults.filter((c) => c.name.toLowerCase() === ql);
    const rest = [...tokenResults, ...chainResults.filter((c) => c.name.toLowerCase() !== ql)];
    return [...exactChain, ...rest];
  },

  getTokenData: fetchTokenData,

  async getChainData(slug: string): Promise<RawChainData> {
    const chains = await llamaChains();
    const entry = chains.find((c) => c.slug === slug);
    if (!entry) throw new Error(`Unknown chain: ${slug}`);

    const [tvlHistory, fees, revenue, stables, protocols, nativeToken] =
      await Promise.all([
        getJson<{ date: number; tvl: number }[]>(
          `${LLAMA}/v2/historicalChainTvl/${encodeURIComponent(entry.name)}`,
        ).catch(() => [] as { date: number; tvl: number }[]),
        getJson<{ total24h?: number | null }>(
          `${LLAMA}/overview/fees/${encodeURIComponent(entry.name)}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyFees`,
        ).catch(() => null),
        getJson<{ total24h?: number | null }>(
          `${LLAMA}/overview/fees/${encodeURIComponent(entry.name)}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyRevenue`,
        ).catch(() => null),
        cached("llama:stablecoinchains", LIBRARY_TTL_MS, () =>
          getJson<{ name: string; totalCirculatingUSD?: Record<string, number> }[]>(
            `${STABLES}/stablecoinchains`,
          ),
        ).catch(() => null),
        cached("llama:protocols", LIBRARY_TTL_MS, () =>
          getJson<
            { name: string; category?: string; chainTvls?: Record<string, number> }[]
          >(`${LLAMA}/protocols`),
        ).catch(() => null),
        entry.geckoId ? fetchTokenData(entry.geckoId).catch(() => null) : Promise.resolve(null),
      ]);

    const stableRow = stables?.find((s) => s.name === entry.name);
    const stablecoinSupplyUsd = stableRow
      ? Object.values(stableRow.totalCirculatingUSD ?? {}).reduce((a, b) => a + b, 0)
      : null;

    // CEX entries are exchange custody balances, not ecosystem protocols, and
    // are excluded from DeFiLlama's chain TVL: keeping them here would push
    // the top-protocol concentration share past 100%.
    const chainProtocols: NetworkProtocol[] = (protocols ?? [])
      .filter((p) => (p.category ?? "") !== "CEX")
      .map((p) => ({
        name: p.name,
        category: p.category ?? "Other",
        tvl: p.chainTvls?.[entry.name] ?? 0,
      }))
      .filter((p) => p.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl);

    const ref: AssetRef = {
      id: entry.slug,
      type: "chain",
      name: entry.name,
      symbol: entry.tokenSymbol ?? "",
      coingeckoId: entry.geckoId,
      image: nativeToken?.ref.image ?? null,
    };

    return {
      ref,
      tvl: entry.tvl,
      tvlHistory: tvlHistory.map((r) => ({ t: r.date * 1000, v: r.tvl })),
      fees24h: fees?.total24h ?? null,
      revenue24h: revenue?.total24h ?? null,
      stablecoinSupplyUsd,
      protocols: chainProtocols,
      allChains: chains,
      nativeToken,
    };
  },

  async getCohort(subjectId: string, marketCap: number | null): Promise<CohortRaw> {
    // Cohort selection: market-cap band peers from the top 250 by cap.
    // Category-first matching is a known refinement; see docs for limitations.
    const rows = await cached("cg:markets:top250", MARKET_TTL_MS, () =>
      cg<CgMarketRow[]>(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=90d`,
      ),
    );
    const inBand = marketCap
      ? rows.filter(
          (r) =>
            (r.market_cap ?? 0) > marketCap / 8 && (r.market_cap ?? 0) < marketCap * 8,
        )
      : rows;
    const peers = (inBand.length >= 12 ? inBand : rows).filter(
      (r) => r.id !== subjectId,
    );
    return {
      label: marketCap
        ? `${peers.length} peers in the same market cap band (top 250)`
        : `${peers.length} peers from the top 250 by market cap`,
      peers: peers.map((r) => ({
        id: r.id,
        name: r.name,
        symbol: (r.symbol ?? "").toUpperCase(),
        marketCap: r.market_cap ?? null,
        fdv: r.fully_diluted_valuation ?? null,
        volume24h: r.total_volume ?? null,
        athChangePct: r.ath_change_percentage ?? null,
        return90dPct: r.price_change_percentage_90d_in_currency ?? null,
      })),
    };
  },

  async getMarketSnapshot(): Promise<MarketSnapshotRaw> {
    return cached("market:snapshot", MARKET_TTL_MS, async () => {
      const [btcChart, fng, global, trendingRes] = await Promise.all([
        cg<{ prices: [number, number][] }>(
          `/coins/bitcoin/market_chart?vs_currency=usd&days=365`,
        ),
        getJson<{ data?: { value?: string; value_classification?: string }[] }>(
          FNG,
        ).catch(() => null),
        cg<{
          data?: {
            total_market_cap?: { usd?: number };
            market_cap_percentage?: { btc?: number };
            market_cap_change_percentage_24h_usd?: number;
          };
        }>(`/global`).catch(() => null),
        cg<{
          coins?: {
            item: {
              id: string;
              name: string;
              symbol: string;
              data?: { price_change_percentage_24h?: { usd?: number } };
            };
          }[];
        }>(`/search/trending`).catch(() => null),
      ]);
      const fngRow = fng?.data?.[0];
      const trending: TrendingItem[] = (trendingRes?.coins ?? []).map(({ item }) => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol.toUpperCase(),
        change24hPct: item.data?.price_change_percentage_24h?.usd ?? null,
      }));
      return {
        btcCloses: (btcChart.prices ?? []).map(([t, v]) => ({ t, v })),
        fearGreed: fngRow
          ? {
              value: Number(fngRow.value ?? 50),
              label: fngRow.value_classification ?? "Neutral",
            }
          : null,
        totalMarketCapUsd: global?.data?.total_market_cap?.usd ?? null,
        marketCapChange24hPct:
          global?.data?.market_cap_change_percentage_24h_usd ?? null,
        btcDominancePct: global?.data?.market_cap_percentage?.btc ?? null,
        trending,
      };
    });
  },

  async getPrices(ids: string[]): Promise<PriceQuote[]> {
    if (ids.length === 0) return [];
    const data = await cg<Record<string, { usd?: number; usd_24h_change?: number }>>(
      `/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd&include_24hr_change=true`,
    );
    return ids.map((id) => ({
      id,
      priceUsd: data[id]?.usd ?? null,
      change24hPct: data[id]?.usd_24h_change ?? null,
    }));
  },

  async getTopTokens(n: number): Promise<LibraryEntry[]> {
    const rows = await cached("cg:markets:top30", LIBRARY_TTL_MS, () =>
      cg<CgMarketRow[]>(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1`,
      ),
    );
    return rows
      .filter((r) => !STABLECOIN_IDS.has(r.id) && !WRAPPER_IDS.has(r.id))
      .slice(0, n)
      .map((r, i) => ({
        rank: i + 1,
        marketCap: r.market_cap ?? null,
        asset: {
          id: r.id,
          type: "token" as const,
          name: r.name,
          symbol: (r.symbol ?? "").toUpperCase(),
          image: r.image ?? null,
          marketCapRank: r.market_cap_rank ?? null,
        },
      }));
  },

  async getTopChains(n: number): Promise<LibraryEntry[]> {
    const chains = await llamaChains();
    return chains.slice(0, n).map((c, i) => ({
      rank: i + 1,
      tvl: c.tvl,
      asset: {
        id: c.slug,
        type: "chain" as const,
        name: c.name,
        symbol: c.tokenSymbol ?? "",
        coingeckoId: c.geckoId,
      },
    }));
  },
};
