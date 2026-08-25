// Shared CoinGecko API configuration: one place decides the base host and
// auth header for both the market data provider and the onchain analytics
// module, per https://docs.coingecko.com (demo vs pro tiers).
//
// Env (server-side only, never NEXT_PUBLIC):
// - COINGECKO_API_KEY: the API key (demo or pro).
// - COINGECKO_API_TIER: "demo" (default) or "pro". Pro keys use the
//   pro-api host and the x-cg-pro-api-key header.

export type CgTier = "demo" | "pro";

export function cgTier(): CgTier {
  return process.env.COINGECKO_API_TIER === "pro" ? "pro" : "demo";
}

export function cgApiBase(tier: CgTier = cgTier()): string {
  return tier === "pro"
    ? "https://pro-api.coingecko.com/api/v3"
    : "https://api.coingecko.com/api/v3";
}

export function cgOnchainBase(tier: CgTier = cgTier()): string {
  return `${cgApiBase(tier)}/onchain`;
}

export function cgApiHeaders(
  key: string | undefined = process.env.COINGECKO_API_KEY,
  tier: CgTier = cgTier(),
): Record<string, string> | undefined {
  if (!key) return undefined;
  return tier === "pro"
    ? { "x-cg-pro-api-key": key }
    : { "x-cg-demo-api-key": key };
}
