# Report library

## Summary

The premade shelf: the current top 10 tokens by market cap (excluding
stablecoins and wrapped/staked derivatives) and the current top 10 chains by
TVL, as instantly navigable cards. Membership is recomputed from live
rankings on every refresh, never hardcoded, so the shelf drifts with the
market.

## Entry points

- Page: app/library/page.tsx.
- API: GET /api/library.
- Provider methods: getTopTokens(n), getTopChains(n).

## Flow

1. The page derives both lists from provider data and caches them for 6 hours.
2. Stablecoins and wrapper assets filter out via an explicit id blocklist in
   the live provider (USDT, USDC, WBTC, stETH and friends), matching the
   plan's "explicit category check, not just top N" rule.
3. Cards link into the standard report route: the library is a pointer list,
   not a separate report path.

## Data touched

The library list cache (in process, 6h TTL). Report payloads themselves cache
on first open (24h TTL).

## Business rules / security

The plan's scheduled pre-generation job is an upgrade path; in this build the
first click on a card generates the report and the cache makes revisits
instant. The page says so rather than implying pre-generation exists.

## Edge cases

- Fixture mode labels the rankings as synthetic.
- Provider failure renders an explicit unavailable card instead of an empty
  shelf.

## Non-goals

Cron-based pre-generation and the per-asset refresh status panel (partially
covered by the freshness list in Settings).

## Tests

TL-005 (e2e: 20 cards, card opens a report);
lib/providers/__tests__/fixture.test.ts ranking suite.
