# Search and resolution

## Summary

The front door. Free-text input resolves against live provider data (CoinGecko
coin search for tokens, the DeFiLlama chain list for chains) with no fixed
universe. Ambiguous input renders a disambiguation list before any report is
generated: a wrong silent match would produce a report about the wrong asset,
which is worse than no report.

## Entry points

- UI: components/SearchBox.tsx on the home page (app/page.tsx).
- API: GET /api/search?q=... (app/api/search/route.ts).
- Provider methods: search() in lib/providers/live.ts and fixture.ts.

## Flow

1. Input debounces 250ms, then calls /api/search (aborting stale requests).
2. The provider queries CoinGecko /search and the cached DeFiLlama chain list
   in parallel, merges results, and ranks: an exact chain-name match first,
   then tokens by market cap rank, then remaining chain matches.
3. Every result carries a type badge (token or chain) and a hint (cap rank or
   "Blockchain network") so collisions like LUNA vs LUNC or ETH-the-token vs
   Ethereum-the-chain are user-resolved, never guessed.
4. Selection navigates to /report/{type}/{id}; generation happens there.

## Data touched

Read-only provider calls. No persistence.

## Business rules / security

- Queries under 2 characters return nothing (rate-limit hygiene).
- Provider errors surface in the dropdown as errors; the UI never fabricates
  matches.
- The API key, when present, stays server side (route handler); nothing
  provider-related ships in client env vars.

## Edge cases

- Ticker collisions (LUNA/LUNC in the fixture catalog) must all appear.
- Exact chain names ("ethereum") rank the chain above the same-named token.
- Chains without a native token (Base) resolve and open a chain report with
  token analysis omitted.

## Non-goals

Contract-address resolution across chains and category-filtered search are
future refinements. No search history is persisted (the plan's search_log is
part of the review-tier upgrade path, not this build).

## Tests

TL-002, TL-003, TL-004 (e2e/home-search.spec.ts);
lib/providers/__tests__/fixture.test.ts search suite.
