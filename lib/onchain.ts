// CoinGecko onchain DEX analytics (GeckoTerminal-backed endpoints under
// /api/v3/onchain, see docs.coingecko.com/docs/defi-onchain-analytics).
// Server-side only: the API key never reaches the client, and the /api/onchain
// route in front of this module is gated by the email OTP session.

import { cgApiHeaders, cgOnchainBase } from "@/lib/providers/coingecko";
import { hashSeed, mulberry32 } from "@/lib/rng";

export interface OnchainPool {
  name: string;
  address: string;
  priceUsd: number | null;
  priceChange24hPct: number | null;
  volume24hUsd: number | null;
  reserveUsd: number | null;
}

export const ONCHAIN_NETWORKS = [
  { id: "eth", label: "Ethereum" },
  { id: "solana", label: "Solana" },
  { id: "bsc", label: "BNB Chain" },
  { id: "base", label: "Base" },
  { id: "arbitrum", label: "Arbitrum" },
] as const;

export type OnchainNetworkId = (typeof ONCHAIN_NETWORKS)[number]["id"];

export function isOnchainNetwork(id: string): id is OnchainNetworkId {
  return ONCHAIN_NETWORKS.some((n) => n.id === id);
}

interface CgTrendingPoolsResponse {
  data?: Array<{
    attributes?: {
      name?: string;
      address?: string;
      base_token_price_usd?: string | null;
      reserve_in_usd?: string | null;
      price_change_percentage?: { h24?: string | null };
      volume_usd?: { h24?: string | null };
    };
  }>;
}

function num(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Pure response mapping, unit-tested against the documented shape. */
export function parseTrendingPools(json: CgTrendingPoolsResponse): OnchainPool[] {
  return (json.data ?? [])
    .map((row) => row.attributes ?? {})
    .filter((a) => a.name && a.address)
    .map((a) => ({
      name: a.name as string,
      address: a.address as string,
      priceUsd: num(a.base_token_price_usd),
      priceChange24hPct: num(a.price_change_percentage?.h24),
      volume24hUsd: num(a.volume_usd?.h24),
      reserveUsd: num(a.reserve_in_usd),
    }));
}

/** Deterministic pools for fixture mode and e2e: no egress, stable values. */
export function fixtureTrendingPools(network: string): OnchainPool[] {
  const pairs = [
    ["WETH / USDC", "0.05%"],
    ["WBTC / WETH", "0.3%"],
    ["SOL / USDC", ""],
    ["LINK / WETH", "0.3%"],
    ["ARB / USDC", "0.05%"],
    ["PEPE / WETH", "1%"],
  ];
  const rand = mulberry32(hashSeed(`onchain:${network}`));
  return pairs.map(([pair, fee], i) => ({
    name: fee ? `${pair} ${fee}` : pair,
    address: `0xfixture${network}${i}`,
    priceUsd: Math.round(rand() * 4000 * 100) / 100,
    priceChange24hPct: Math.round((rand() * 20 - 10) * 100) / 100,
    volume24hUsd: Math.round(rand() * 80_000_000),
    reserveUsd: Math.round(rand() * 300_000_000),
  }));
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; pools: OnchainPool[] }>();

export async function fetchTrendingPools(
  network: OnchainNetworkId,
  fetchImpl: typeof fetch = fetch,
  now: number = Date.now(),
): Promise<OnchainPool[]> {
  const hit = cache.get(network);
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.pools;
  const res = await fetchImpl(
    `${cgOnchainBase()}/networks/${network}/trending_pools?page=1`,
    { headers: cgApiHeaders(), cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`CoinGecko onchain request failed (${res.status})`);
  }
  const pools = parseTrendingPools(
    (await res.json()) as CgTrendingPoolsResponse,
  );
  cache.set(network, { at: now, pools });
  return pools;
}

export function _resetOnchainCacheForTests() {
  cache.clear();
}
