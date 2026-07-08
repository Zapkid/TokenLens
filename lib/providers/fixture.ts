// Fixture provider: deterministic synthetic data shaped exactly like the live
// provider's output. Used by unit tests, e2e tests, and sandboxes without
// network egress. Reports generated from it are labeled in the UI so synthetic
// numbers are never mistaken for market data.

import { gaussian, hashSeed, mulberry32 } from "../rng";
import type {
  AssetRef,
  LibraryEntry,
  PriceQuote,
  SearchResult,
  SeriesPoint,
} from "../types";
import type {
  CohortRaw,
  DataProvider,
  MarketSnapshotRaw,
  RawChainData,
  RawChainListEntry,
  RawTokenData,
} from "./types";

interface TokenSpec {
  id: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  /** MC divided by FDV, 0 to 1. */
  mcFdvRatio: number;
  volume24h: number;
  annualVol: number;
  /** Annualized drift of the synthetic walk. */
  drift: number;
  athMult: number;
  ageDays: number;
  hasMaxSupply: boolean;
  commits4w: number | null;
  contributors: number | null;
  categories: string[];
}

const TOKENS: TokenSpec[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 118_000, marketCap: 2.35e12, mcFdvRatio: 0.95, volume24h: 4.2e10, annualVol: 0.45, drift: 0.35, athMult: 1.04, ageDays: 6000, hasMaxSupply: true, commits4w: 120, contributors: 45, categories: ["Layer 1"] },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 3900, marketCap: 4.7e11, mcFdvRatio: 1.0, volume24h: 2.1e10, annualVol: 0.58, drift: 0.2, athMult: 1.25, ageDays: 3900, hasMaxSupply: false, commits4w: 210, contributors: 110, categories: ["Layer 1", "Smart Contract Platform"] },
  { id: "binancecoin", name: "BNB", symbol: "BNB", price: 720, marketCap: 1.05e11, mcFdvRatio: 1.0, volume24h: 2.2e9, annualVol: 0.55, drift: 0.18, athMult: 1.1, ageDays: 3200, hasMaxSupply: true, commits4w: 40, contributors: 18, categories: ["Layer 1", "Exchange Token"] },
  { id: "ripple", name: "XRP", symbol: "XRP", price: 2.4, marketCap: 1.4e11, mcFdvRatio: 0.59, volume24h: 4.5e9, annualVol: 0.72, drift: 0.1, athMult: 1.45, ageDays: 4700, hasMaxSupply: true, commits4w: 25, contributors: 12, categories: ["Payments"] },
  { id: "solana", name: "Solana", symbol: "SOL", price: 185, marketCap: 1.0e11, mcFdvRatio: 0.87, volume24h: 5.5e9, annualVol: 0.78, drift: 0.28, athMult: 1.6, ageDays: 2300, hasMaxSupply: false, commits4w: 260, contributors: 95, categories: ["Layer 1", "Smart Contract Platform"] },
  { id: "tron", name: "TRON", symbol: "TRX", price: 0.3, marketCap: 2.8e10, mcFdvRatio: 1.0, volume24h: 9.0e8, annualVol: 0.5, drift: 0.15, athMult: 1.35, ageDays: 3100, hasMaxSupply: false, commits4w: 35, contributors: 14, categories: ["Layer 1"] },
  { id: "hyperliquid", name: "Hyperliquid", symbol: "HYPE", price: 45, marketCap: 1.5e10, mcFdvRatio: 0.34, volume24h: 4.0e8, annualVol: 1.1, drift: 0.6, athMult: 1.3, ageDays: 590, hasMaxSupply: true, commits4w: 90, contributors: 12, categories: ["Derivatives", "Layer 1"] },
  { id: "chainlink", name: "Chainlink", symbol: "LINK", price: 18, marketCap: 1.2e10, mcFdvRatio: 0.68, volume24h: 6.5e8, annualVol: 0.82, drift: 0.05, athMult: 2.9, ageDays: 2900, hasMaxSupply: true, commits4w: 140, contributors: 40, categories: ["Oracle", "Infrastructure"] },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", price: 28, marketCap: 1.2e10, mcFdvRatio: 0.58, volume24h: 5.0e8, annualVol: 0.9, drift: -0.05, athMult: 5.2, ageDays: 2100, hasMaxSupply: true, commits4w: 85, contributors: 30, categories: ["Layer 1", "Smart Contract Platform"] },
  { id: "uniswap", name: "Uniswap", symbol: "UNI", price: 9, marketCap: 5.4e9, mcFdvRatio: 0.6, volume24h: 2.8e8, annualVol: 0.95, drift: 0.0, athMult: 5.0, ageDays: 2100, hasMaxSupply: true, commits4w: 75, contributors: 28, categories: ["DeFi", "DEX"] },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", price: 0.45, marketCap: 2.2e9, mcFdvRatio: 0.49, volume24h: 1.6e8, annualVol: 1.0, drift: -0.15, athMult: 5.4, ageDays: 1200, hasMaxSupply: true, commits4w: 110, contributors: 35, categories: ["Layer 2", "Scaling"] },
  { id: "polygon-ecosystem-token", name: "POL (ex-MATIC)", symbol: "POL", price: 0.25, marketCap: 2.5e9, mcFdvRatio: 0.9, volume24h: 1.2e8, annualVol: 0.92, drift: -0.2, athMult: 11.6, ageDays: 1900, hasMaxSupply: false, commits4w: 95, contributors: 33, categories: ["Layer 2", "Scaling"] },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", price: 0.21, marketCap: 3.1e10, mcFdvRatio: 1.0, volume24h: 1.8e9, annualVol: 0.98, drift: 0.05, athMult: 3.5, ageDays: 4500, hasMaxSupply: false, commits4w: 8, contributors: 4, categories: ["Meme"] },
  { id: "terra-luna-2", name: "Terra", symbol: "LUNA", price: 0.16, marketCap: 1.1e8, mcFdvRatio: 0.65, volume24h: 8.0e6, annualVol: 1.3, drift: -0.5, athMult: 120, ageDays: 1500, hasMaxSupply: false, commits4w: 4, contributors: 2, categories: ["Layer 1"] },
  { id: "terra-luna", name: "Terra Luna Classic", symbol: "LUNC", price: 0.00006, marketCap: 3.3e8, mcFdvRatio: 0.8, volume24h: 2.0e7, annualVol: 1.2, drift: -0.4, athMult: 1_990_000, ageDays: 2500, hasMaxSupply: false, commits4w: 2, contributors: 1, categories: ["Layer 1"] },
];

interface ChainSpec {
  slug: string;
  name: string;
  tvl: number;
  fees24h: number;
  revenue24h: number;
  stableSupply: number;
  geckoId: string | null;
  tokenSymbol: string | null;
  tvlDrift: number;
  tvlVol: number;
  protocols: { name: string; category: string; sharePct: number }[];
}

const CHAINS: ChainSpec[] = [
  { slug: "ethereum", name: "Ethereum", tvl: 6.4e10, fees24h: 9.5e6, revenue24h: 7.6e6, stableSupply: 1.4e11, geckoId: "ethereum", tokenSymbol: "ETH", tvlDrift: 0.15, tvlVol: 0.5, protocols: [
    { name: "Lido", category: "Liquid Staking", sharePct: 28 },
    { name: "Aave", category: "Lending", sharePct: 22 },
    { name: "EigenLayer", category: "Restaking", sharePct: 12 },
    { name: "Maker", category: "CDP", sharePct: 8 },
    { name: "Uniswap", category: "DEX", sharePct: 7 },
  ] },
  { slug: "solana", name: "Solana", tvl: 9.5e9, fees24h: 2.8e6, revenue24h: 1.4e6, stableSupply: 1.2e10, geckoId: "solana", tokenSymbol: "SOL", tvlDrift: 0.35, tvlVol: 0.7, protocols: [
    { name: "Jito", category: "Liquid Staking", sharePct: 26 },
    { name: "Kamino", category: "Lending", sharePct: 20 },
    { name: "Raydium", category: "DEX", sharePct: 14 },
    { name: "Marinade", category: "Liquid Staking", sharePct: 9 },
  ] },
  { slug: "bsc", name: "BSC", tvl: 6.0e9, fees24h: 1.6e6, revenue24h: 8.0e5, stableSupply: 7.0e9, geckoId: "binancecoin", tokenSymbol: "BNB", tvlDrift: 0.05, tvlVol: 0.5, protocols: [
    { name: "PancakeSwap", category: "DEX", sharePct: 38 },
    { name: "Venus", category: "Lending", sharePct: 22 },
    { name: "Lista", category: "CDP", sharePct: 9 },
  ] },
  { slug: "tron", name: "Tron", tvl: 5.4e9, fees24h: 2.1e6, revenue24h: 2.0e6, stableSupply: 6.5e10, geckoId: "tron", tokenSymbol: "TRX", tvlDrift: 0.05, tvlVol: 0.35, protocols: [
    { name: "JustLend", category: "Lending", sharePct: 62 },
    { name: "SUN", category: "DEX", sharePct: 18 },
  ] },
  { slug: "base", name: "Base", tvl: 4.2e9, fees24h: 9.0e5, revenue24h: 6.0e5, stableSupply: 4.5e9, geckoId: null, tokenSymbol: null, tvlDrift: 0.5, tvlVol: 0.8, protocols: [
    { name: "Aerodrome", category: "DEX", sharePct: 30 },
    { name: "Morpho", category: "Lending", sharePct: 24 },
    { name: "Moonwell", category: "Lending", sharePct: 10 },
  ] },
  { slug: "hyperliquid-l1", name: "Hyperliquid L1", tvl: 3.9e9, fees24h: 2.5e6, revenue24h: 2.4e6, stableSupply: 3.4e9, geckoId: "hyperliquid", tokenSymbol: "HYPE", tvlDrift: 0.9, tvlVol: 1.0, protocols: [
    { name: "Hyperliquid Perps", category: "Derivatives", sharePct: 71 },
    { name: "HyperLend", category: "Lending", sharePct: 12 },
  ] },
  { slug: "arbitrum", name: "Arbitrum", tvl: 2.9e9, fees24h: 3.5e5, revenue24h: 1.2e5, stableSupply: 3.8e9, geckoId: "arbitrum", tokenSymbol: "ARB", tvlDrift: -0.05, tvlVol: 0.6, protocols: [
    { name: "GMX", category: "Derivatives", sharePct: 18 },
    { name: "Aave V3", category: "Lending", sharePct: 17 },
    { name: "Camelot", category: "DEX", sharePct: 9 },
  ] },
  { slug: "avalanche", name: "Avalanche", tvl: 1.4e9, fees24h: 1.2e5, revenue24h: 6.0e4, stableSupply: 1.9e9, geckoId: "avalanche-2", tokenSymbol: "AVAX", tvlDrift: -0.1, tvlVol: 0.6, protocols: [
    { name: "Benqi", category: "Lending", sharePct: 32 },
    { name: "Trader Joe", category: "DEX", sharePct: 20 },
  ] },
  { slug: "polygon", name: "Polygon", tvl: 1.1e9, fees24h: 9.0e4, revenue24h: 4.0e4, stableSupply: 1.6e9, geckoId: "polygon-ecosystem-token", tokenSymbol: "POL", tvlDrift: -0.15, tvlVol: 0.55, protocols: [
    { name: "Polymarket", category: "Prediction Market", sharePct: 30 },
    { name: "Aave V3", category: "Lending", sharePct: 25 },
    { name: "QuickSwap", category: "DEX", sharePct: 10 },
  ] },
  { slug: "optimism", name: "OP Mainnet", tvl: 9.0e8, fees24h: 1.1e5, revenue24h: 5.0e4, stableSupply: 1.0e9, geckoId: "optimism", tokenSymbol: "OP", tvlDrift: -0.1, tvlVol: 0.6, protocols: [
    { name: "Velodrome", category: "DEX", sharePct: 28 },
    { name: "Aave V3", category: "Lending", sharePct: 22 },
  ] },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deterministic geometric walk ending exactly at endValue. Seeded per asset so
 * every generation of the same asset produces the same series values.
 */
export function synthSeries(
  seedKey: string,
  endValue: number,
  days: number,
  annualVol: number,
  annualDrift: number,
): SeriesPoint[] {
  const rand = mulberry32(hashSeed(seedKey));
  const dailyVol = annualVol / Math.sqrt(365);
  const dailyDrift = annualDrift / 365;
  const logSteps: number[] = [];
  for (let i = 0; i < days - 1; i++) {
    logSteps.push(dailyDrift + dailyVol * gaussian(rand));
  }
  // Build forward from 1, then rescale so the final point equals endValue.
  const raw: number[] = [1];
  for (const s of logSteps) raw.push(raw[raw.length - 1] * Math.exp(s));
  const scale = endValue / raw[raw.length - 1];
  const now = Date.now();
  return raw.map((v, i) => ({
    t: now - (days - 1 - i) * DAY_MS,
    v: v * scale,
  }));
}

function tokenData(spec: TokenSpec): RawTokenData {
  const days = Math.min(730, spec.ageDays);
  const dailyCloses = synthSeries(
    `price:${spec.id}`,
    spec.price,
    days,
    spec.annualVol,
    spec.drift,
  );
  const circulating = spec.marketCap / spec.price;
  const fdv = spec.marketCap / spec.mcFdvRatio;
  const totalSupply = fdv / spec.price;
  const genesis = new Date(Date.now() - spec.ageDays * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const ref: AssetRef = {
    id: spec.id,
    type: "token",
    name: spec.name,
    symbol: spec.symbol,
    image: null,
    marketCapRank: TOKENS.filter((t) => t.marketCap > spec.marketCap).length + 1,
    category: spec.categories[0] ?? null,
  };
  return {
    ref,
    priceUsd: spec.price,
    marketCap: spec.marketCap,
    fdv,
    volume24h: spec.volume24h,
    athUsd: spec.price * spec.athMult,
    atlUsd: spec.price / 50,
    circulatingSupply: circulating,
    totalSupply,
    maxSupply: spec.hasMaxSupply ? totalSupply : null,
    categories: spec.categories,
    genesisDate: genesis,
    dailyCloses,
    devActivity: {
      commits4w: spec.commits4w,
      contributors: spec.contributors,
      stars: spec.commits4w ? spec.commits4w * 100 : null,
    },
  };
}

function chainList(): RawChainListEntry[] {
  return CHAINS.map((c) => ({
    slug: c.slug,
    name: c.name,
    tvl: c.tvl,
    geckoId: c.geckoId,
    tokenSymbol: c.tokenSymbol,
  }));
}

export const fixtureProvider: DataProvider = {
  mode: "fixture",

  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tokens: SearchResult[] = TOKENS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.id.includes(q),
    ).map((t) => ({
      id: t.id,
      type: "token",
      name: t.name,
      symbol: t.symbol,
      marketCapRank: TOKENS.filter((x) => x.marketCap > t.marketCap).length + 1,
      hint: `Token, market cap rank #${TOKENS.filter((x) => x.marketCap > t.marketCap).length + 1}`,
    }));
    const chains: SearchResult[] = CHAINS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tokenSymbol ?? "").toLowerCase() === q,
    ).map((c) => ({
      id: c.slug,
      type: "chain",
      name: c.name,
      symbol: c.tokenSymbol ?? "",
      coingeckoId: c.geckoId,
      hint: "Blockchain network",
    }));
    const exactChain = chains.filter((c) => c.name.toLowerCase() === q);
    const sortedTokens = tokens.sort(
      (a, b) => (a.marketCapRank ?? 999) - (b.marketCapRank ?? 999),
    );
    return [
      ...exactChain,
      ...sortedTokens,
      ...chains.filter((c) => c.name.toLowerCase() !== q),
    ].slice(0, 10);
  },

  async getTokenData(id: string): Promise<RawTokenData> {
    const spec = TOKENS.find((t) => t.id === id);
    if (!spec) throw new Error(`Unknown fixture token: ${id}`);
    return tokenData(spec);
  },

  async getChainData(slug: string): Promise<RawChainData> {
    const spec = CHAINS.find((c) => c.slug === slug);
    if (!spec) throw new Error(`Unknown fixture chain: ${slug}`);
    const tvlHistory = synthSeries(
      `tvl:${spec.slug}`,
      spec.tvl,
      730,
      spec.tvlVol,
      spec.tvlDrift,
    );
    const nativeSpec = spec.geckoId
      ? TOKENS.find((t) => t.id === spec.geckoId)
      : null;
    const ref: AssetRef = {
      id: spec.slug,
      type: "chain",
      name: spec.name,
      symbol: spec.tokenSymbol ?? "",
      coingeckoId: spec.geckoId,
      image: null,
    };
    return {
      ref,
      tvl: spec.tvl,
      tvlHistory,
      fees24h: spec.fees24h,
      revenue24h: spec.revenue24h,
      stablecoinSupplyUsd: spec.stableSupply,
      protocols: spec.protocols.map((p) => ({
        name: p.name,
        category: p.category,
        tvl: (p.sharePct / 100) * spec.tvl,
      })),
      allChains: chainList(),
      nativeToken: nativeSpec ? tokenData(nativeSpec) : null,
    };
  },

  async getCohort(subjectId: string, marketCap: number | null): Promise<CohortRaw> {
    const peers = TOKENS.filter((t) => t.id !== subjectId);
    const banded = marketCap
      ? peers.filter(
          (t) => t.marketCap > marketCap / 20 && t.marketCap < marketCap * 20,
        )
      : peers;
    const chosen = banded.length >= 6 ? banded : peers;
    return {
      label: `${chosen.length} fixture peers in the same market cap band`,
      peers: chosen.map((t) => {
        const rand = mulberry32(hashSeed(`cohort:${t.id}`));
        return {
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          marketCap: t.marketCap,
          fdv: t.marketCap / t.mcFdvRatio,
          volume24h: t.volume24h,
          athChangePct: (1 / t.athMult - 1) * 100,
          return90dPct: (rand() - 0.45) * 80,
        };
      }),
    };
  },

  async getMarketSnapshot(): Promise<MarketSnapshotRaw> {
    const btc = TOKENS[0];
    return {
      btcCloses: synthSeries(`price:${btc.id}`, btc.price, 365, btc.annualVol, btc.drift),
      fearGreed: { value: 62, label: "Greed" },
      totalMarketCapUsd: 3.9e12,
      marketCapChange24hPct: 1.2,
      btcDominancePct: 55,
      trending: TOKENS.slice(0, 7).map((t, i) => {
        const rand = mulberry32(hashSeed(`trend:${t.id}`));
        return {
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          change24hPct: (rand() - 0.4) * 12 + (i === 0 ? 2 : 0),
        };
      }),
    };
  },

  async getPrices(ids: string[]): Promise<PriceQuote[]> {
    return ids.map((id) => {
      const t = TOKENS.find((x) => x.id === id);
      const rand = mulberry32(hashSeed(`quote:${id}`));
      return {
        id,
        priceUsd: t ? t.price : null,
        change24hPct: t ? (rand() - 0.45) * 8 : null,
      };
    });
  },

  async getTopTokens(n: number): Promise<LibraryEntry[]> {
    return [...TOKENS]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, n)
      .map((t, i) => ({
        rank: i + 1,
        marketCap: t.marketCap,
        asset: {
          id: t.id,
          type: "token" as const,
          name: t.name,
          symbol: t.symbol,
          marketCapRank: i + 1,
        },
      }));
  },

  async getTopChains(n: number): Promise<LibraryEntry[]> {
    return [...CHAINS]
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, n)
      .map((c, i) => ({
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
