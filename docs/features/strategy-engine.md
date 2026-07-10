# Strategy engine

## Summary

One engine behind the report Strategy section and the Portfolio page: tier
classification from scores, position caps, regime-scaled DCA schedules,
default exit ladders, review triggers, and band-based rebalancing.

## Entry points

- lib/report/strategy.ts: classifyTier, buildStrategyGuidance, dcaWeeksFor,
  dcaSchedule, analyzePortfolio, TIER_LABELS.
- Rendered by the Strategy section (ReportView) and app/portfolio/page.tsx.

## Flow

1. Tiers: Core is reserved for BTC/ETH at grade A-B. Quality requires grade
   B-C and opportunity 60+. Speculative requires grade D-E and opportunity
   70+ with a 3% hard cap. Everything else gets "No allocation suggested".
2. Entry: DCA over 12 weeks in risk-on regimes, 8 neutral, 4 risk-off, with
   an illustrative weekly schedule.
3. Exits: a laddered take-profit plan (20% at +50%, 20% at +100%, 25% at
   +200%) plus review triggers (30% drawdown from cost basis, full-letter
   grade deterioration) that prompt reassessment, never automatic selling.
4. Rebalancing: see portfolio-and-watchlist.md.

## Data touched

Pure functions. Guidance embeds in the report payload.

## Business rules / security

The tier gate is deliberately strict: a mediocre grade with mediocre
opportunity earns no allocation rather than a small one. Position caps and
the harvest-into-core rule implement "balance profit potential against risk"
mechanically.

## Edge cases

Zero or negative DCA inputs return empty schedules; avoid-tier reports render
a watch-instead message rather than a schedule.

## Non-goals

Inverse-volatility sizing within tiers, pairwise correlation checks, unlock
alerts, and backtest-lite are designed but not wired.

## Tests

lib/report/__tests__/strategy.test.ts; strategy section rendering covered by
TL-010.
