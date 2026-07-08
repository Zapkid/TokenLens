import type {
  AssetRef,
  DataMode,
  LibraryEntry,
  NetworkProtocol,
  PriceQuote,
  SearchResult,
  SeriesPoint,
  TrendingItem,
} from "../types";

export interface RawDevActivity {
  commits4w: number | null;
  contributors: number | null;
  stars: number | null;
}

export interface RawTokenData {
  ref: AssetRef;
  priceUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  athUsd: number | null;
  atlUsd: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  categories: string[];
  genesisDate: string | null;
  /** Daily closes, oldest first, target 730 days. */
  dailyCloses: SeriesPoint[];
  devActivity: RawDevActivity | null;
}

export interface RawChainListEntry {
  slug: string;
  name: string;
  tvl: number | null;
  geckoId: string | null;
  tokenSymbol: string | null;
}

export interface RawChainData {
  ref: AssetRef;
  tvl: number | null;
  tvlHistory: SeriesPoint[];
  fees24h: number | null;
  revenue24h: number | null;
  stablecoinSupplyUsd: number | null;
  protocols: NetworkProtocol[];
  allChains: RawChainListEntry[];
  nativeToken: RawTokenData | null;
}

export interface CohortPeerRaw {
  id: string;
  name: string;
  symbol: string;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  athChangePct: number | null;
  return90dPct: number | null;
}

export interface CohortRaw {
  label: string;
  peers: CohortPeerRaw[];
}

export interface MarketSnapshotRaw {
  btcCloses: SeriesPoint[];
  fearGreed: { value: number; label: string } | null;
  totalMarketCapUsd: number | null;
  marketCapChange24hPct: number | null;
  btcDominancePct: number | null;
  trending: TrendingItem[];
}

export interface DataProvider {
  mode: DataMode;
  search(query: string): Promise<SearchResult[]>;
  getTokenData(id: string): Promise<RawTokenData>;
  getChainData(slug: string): Promise<RawChainData>;
  getCohort(subjectId: string, marketCap: number | null): Promise<CohortRaw>;
  getMarketSnapshot(): Promise<MarketSnapshotRaw>;
  getPrices(ids: string[]): Promise<PriceQuote[]>;
  getTopTokens(n: number): Promise<LibraryEntry[]>;
  getTopChains(n: number): Promise<LibraryEntry[]>;
}
