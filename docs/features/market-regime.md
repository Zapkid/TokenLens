# Market regime indicator

## Summary

One piece of market-wide state every report draws on: a risk-on / neutral /
risk-off composite shown above the search box and fed into every trajectory.

## Entry points

- lib/report/regime.ts: computeRegime(marketSnapshot).
- Displayed on app/page.tsx (RegimeBanner); available via GET /api/market.

## Flow

Components, each contributing a -1..1 signal, averaged: BTC 50/200 day trend
structure, BTC 30 day momentum (scaled by 15%), Fear and Greed (centered at
50), and total market cap 24h change (scaled by 5%). Score above 0.2 reads
risk-on, below -0.2 risk-off.

## Data touched

Provider market snapshot (BTC daily closes, Fear and Greed, global market
cap). Cached 15 minutes.

## Business rules / security

The regime shifts trajectory probabilities (risk-off caps the bull case) and
scales the DCA schedule length. Missing components simply drop out of the
average; with nothing available the regime is neutral, never guessed.

## Edge cases

Empty BTC history, null Fear and Greed, null market cap: all covered by unit
tests; the banner renders whatever components exist.

## Non-goals

BTC dominance trend and top-100 breadth (plan inputs) need historical series
the free tier does not provide cheaply; they are listed refinements.

## Tests

lib/report/__tests__/regime.test.ts; TL-001 (banner renders).
