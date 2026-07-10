# Compare

## Summary

Side-by-side comparison of 2 to 4 previously generated reports (tokens,
chains, or a mix): radar charts of opportunity and risk pillar scores plus a
score and pillar table. Works entirely over the saved-report shelf, so it
costs zero API calls.

## Entry points

- Page: app/compare/page.tsx.
- Chart: components/charts/RadarCompare.tsx.
- Pure helpers: lib/compare.ts (buildRadarData, rescoreAll, marketCapOf).

## Flow

1. Reports save to the localStorage shelf automatically when viewed (bounded
   to the 12 most recent).
2. The picker offers the shelf; selecting 2 to 4 builds radar data with one
   row per pillar and one series per report.
3. Scores in the table recompute live with the user's weights and risk
   profile via the same computeScores used everywhere.

## Data touched

localStorage shelf (read only).

## Business rules / security

- Series colors assign in fixed slot order (series 1, 2, 3, 5), never
  generated; at most 4 series; a legend is always present.
- Opportunity and risk render as two separate radars, never a dual-axis
  chart.
- Null pillar scores plot as 0 and are flagged "(no data)" in tooltips rather
  than being invented.

## Edge cases

- Fewer than 2 saved reports: explanatory empty state (TL-051).
- Selecting beyond 4 is prevented; the cap is also enforced in
  buildRadarData.

## Non-goals

The normalized relative-performance chart from the plan is a future addition.

## Tests

lib/__tests__/compare.test.ts (9 cases); TL-050, TL-051 (e2e).
