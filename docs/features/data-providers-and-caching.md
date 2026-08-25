# Data providers and caching

## Summary

All data access goes through one DataProvider interface with two
implementations: live (CoinGecko, DeFiLlama, alternative.me, all free tiers)
and fixture (deterministic synthetic data from seeded generators). The mode
is an explicit server-side switch, and fixture-mode reports are visibly
labeled so synthetic numbers are never mistaken for market data.

## Entry points

- lib/providers/index.ts: getProvider(), currentDataMode()
  (TOKENLENS_DATA_MODE env, default live).
- lib/providers/live.ts, lib/providers/fixture.ts, lib/providers/types.ts.
- lib/cache.ts: in-process TTL cache.

## Flow (live)

- Tokens: CoinGecko coin detail + 365d market chart (2 calls; the free and
  demo tiers cap history at 365 days and reserve the interval param, so the
  request relies on automatic daily granularity); the peer
  cohort comes from a cached top-250 markets call. Dev activity rides along
  on the coin detail (developer_data), so no separate GitHub calls.
- Chains: DeFiLlama chain list, historical chain TVL, fees and revenue
  overviews, stablecoin totals, protocol list (cached 6h, it is heavy), plus
  the native token's CoinGecko data when a gecko id exists.
- Market snapshot (regime + trending): BTC 1y chart, /global, /search/
  trending, Fear and Greed. Cached 15 minutes.
- Budget: a fresh token report costs roughly 3-4 CoinGecko calls thanks to
  the shared cohort cache, comfortably inside the 10k/month free tier.

## Flow (fixture)

A catalog of 15 tokens and 10 chains with plausible mid-2026 parameters.
Price and TVL histories come from seeded geometric walks (lib/rng.ts) that
end exactly at the catalog price, so every generation of the same asset is
value-identical: tests can assert determinism.

## Caching

In-process TTL map: reports 24h, market snapshot and cohort 15m, library and
protocol list 6h. Refresh explicitly busts the report key. On serverless the
cache is per instance; a durable store is the plan's Supabase upgrade path.

## Business rules / security

- CoinGecko key config is shared via lib/providers/coingecko.ts:
  COINGECKO_API_KEY plus COINGECKO_API_TIER (demo default; pro switches to
  the pro-api host and x-cg-pro-api-key header). The same config powers the
  onchain analytics module.
- Attribution: the app footer credits CoinGecko (linked, with logo mark),
  DeFiLlama, and alternative.me per their attribution guidelines.
- Provider keys (COINGECKO_API_KEY, GITHUB_TOKEN) are read server side only;
  nothing secret ships under NEXT_PUBLIC_.
- Live fetches use no-store; our TTL cache is the single caching layer.
- Errors propagate to explicit UI states; the app never silently falls back
  from live to fixture data.

## Edge cases

- Partial provider failures (fees endpoint, stablecoin endpoint) degrade to
  null metrics with catch guards, not failed reports.
- CoinGecko attribution is rendered in the footer per free-tier terms.

## Non-goals

CryptoPanic, RSS, Snapshot/Tally, SEC feeds, and unlock scrapers (see
features-overview.md for the honest-gaps list).

## Tests

lib/providers/__tests__/fixture.test.ts; pipeline tests exercise the whole
provider surface in fixture mode.
