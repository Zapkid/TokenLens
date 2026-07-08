# Settings and methodology

## Summary

The transparency surface: pillar weight sliders with a live re-scoring
preview against the most recently viewed report, one-click reset to defaults,
risk profile selection, a data-freshness list, and a written methodology page
so the app can explain itself.

## Entry points

- Pages: app/settings/page.tsx, app/methodology/page.tsx.
- State: useWeights, useRiskProfile in lib/storage.ts.

## Flow

1. Sliders write the WeightSet to localStorage; every consumer (report view,
   compare, settings preview) recomputes scores client side from the pillar
   sub-scores shipped in report payloads. No regeneration needed.
2. The risk profile switches the dampener and the allocation template
   everywhere at once.
3. The freshness panel lists the saved shelf with generation age and a link
   to refresh.

## Data touched

localStorage weights, riskProfile, savedReports (read).

## Business rules / security

- Weights renormalize, so slider sums need not hit 100%; the UI shows the sum
  for orientation.
- Reports display "custom weights and profile applied" when settings differ
  from defaults, so a screenshotted score is attributable.

## Edge cases

Empty shelf: the preview explains how to get one. Reset restores exact
defaults (e2e TL-030 asserts round-trip equality).

## Non-goals

Multiple named weight sets and per-report weight pinning (payloads already
store weightsVersion, which is the hook for it).

## Tests

TL-030 (e2e live preview + reset); scoring weight-direction unit tests.
