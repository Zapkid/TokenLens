# Portfolio and watchlist

## Summary

Manual holdings entry backed by on-demand reports: live valuation, unrealized
P/L, tier classification, allocation versus the chosen strategy template,
drift detection, and concrete rebalancing suggestions. The watchlist collects
assets from any report page and surfaces on both home and portfolio pages.

## Entry points

- Page: app/portfolio/page.tsx; form component
  components/portfolio/PositionForm.tsx.
- Math: analyzePortfolio in lib/report/strategy.ts (shared with the report
  Strategy section).
- Prices: GET /api/prices?ids=... (CoinGecko simple price or fixture quotes).

## Flow

1. Add a position: token typeahead (via /api/search), quantity, total cost
   basis. Validation gates submit.
2. Positions persist in localStorage; prices fetch once per distinct id set.
3. Each position's tier comes from the last viewed report's strategy tier
   (useAssetTiers, written by ReportView); unclassified assets show a prompt
   to open their report and are treated as speculative in the math.
4. analyzePortfolio computes tier allocations against the profile template
   (70/25/5, 50/35/15, 35/40/25), flags drift beyond the 25% relative band,
   proposes trim/add amounts (speculative trims say "harvest into core"), and
   flags single alts above the 10% cap.

## Data touched

localStorage: positions, assetTiers, watchlist. When a personal token is
configured in Settings these keys additionally mirror to the server-side
personal store so the MCP personal tools share the same state; see
[Personal sync and MCP personal tools](personal-sync.md). Without a token
there is no server persistence.

## Business rules / security

- Unpriced holdings are listed with a warning, never silently valued at zero
  in the UI (they do count as zero in allocation math, which the warning
  explains by listing them).
- Rebalancing is band-based, not calendar-based, mirroring the plan.

## Edge cases

- Empty portfolio, unpriced ids, unclassified tiers, and the exact band edge
  (62.5% core vs 50% target sits at the boundary and is in-band) are unit
  covered.
- Price API failure keeps the page usable with an error note.

## Non-goals

Transactions history, correlation-based diversification metrics, drawdown
alerts, and the DCA checklist generator on the portfolio page (the report's
Strategy section renders a DCA schedule).

## Tests

lib/report/__tests__/strategy.test.ts (analyzePortfolio suite);
components/portfolio/__tests__/PositionForm.test.tsx (component);
TL-040 (e2e).
