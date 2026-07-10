# Scoring system

## Summary

Two independent scores per report (Opportunity 0-100, Risk 0-100, higher is
riskier), combined into an Overall Rating through a risk-aversion dampener.
Every score decomposes into visible pillars, every pillar into labeled inputs,
and all weights are user-editable with instant client-side re-scoring.

## Entry points

- lib/report/scoring.ts: buildOpportunityPillars, buildRiskPillars,
  computeScores, riskGradeOf, quadrantOf, riskReasons, bandScore.
- Consumed by lib/report/pipeline.ts (server defaults) and by
  components/report/ReportView.tsx, app/settings/page.tsx, lib/compare.ts
  (client re-scoring with user weights).

## Flow

1. Metrics with cohort percentiles become direction-adjusted 0-100 inputs;
   metrics without cohorts (volatility, drawdown, dev activity) map through
   explicit piecewise-linear band anchors (bandScore).
2. Pillars average their available inputs; a pillar with no usable inputs
   scores null.
3. computeScores blends pillars by weight, renormalizing around null pillars,
   then applies Overall = Opportunity x (1 - Risk/100 x RiskAversion) with
   RiskAversion 0.8 / 0.6 / 0.4 by profile.
4. Risk maps to grades A (0-20) through E (80-100); the quadrant splits at
   opportunity 55 and risk 50 into Core, Speculative bet, Stable but stale,
   Avoid.

## Data touched

Pure functions, no I/O. Reports store pillar sub-scores plus the weight-set
version used at generation.

## Business rules / security

- Chain reports substitute network metrics into Fundamentals and
  Concentration; the math is otherwise identical to token reports.
- The Narrative pillar is null until the news engine exists: a token must
  never rank higher purely because it is talked about, and a fake neutral 50
  would still distort ranking.
- The Risk section always renders reasons (riskReasons), not just a grade.
- Proxies are labeled as proxies in pillar input text (cap-rank depth proxy,
  MC/FDV dilution approximation, auto-baseline legal score).

## Edge cases

- All pillars null: score falls back to 50 rather than NaN (cannot happen for
  fixture assets; guards live data gaps).
- Weight sums need not equal 100%: renormalization makes proportions the only
  thing that matters.

## Non-goals

Holder-concentration data, verified unlocks, and reviewed legal profiles are
designed inputs that this build approximates and labels honestly.

## Tests

lib/report/__tests__/scoring.test.ts, including the plan appendix worked
example (66.6 opportunity, 56.1 risk, grade C, speculative quadrant).
