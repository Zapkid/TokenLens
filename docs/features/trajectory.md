# Trajectory scenarios

## Summary

Bear / base / bull scenarios over 3, 6, and 12 month horizons, built from a
realized-volatility cone and adjusted by structured, visible modifiers. Output
is always a probability-weighted range plus a driver summary, never a single
price target. Chain reports run the engine twice: on price and on TVL.

## Entry points

- lib/report/trajectory.ts: computeTrajectory(kind, series, ctx).
- Rendered by the Trajectory section in components/report/ReportView.tsx with
  components/charts/FanChart.tsx.

## Flow

1. Annualized volatility from the trailing daily closes (365 days on the
   free CoinGecko tier, 730 in fixture mode); under 180
   observations the engine declares insufficient history and stops.
2. Cone per horizon: base band is plus/minus 0.5 sigma, bear reaches -1.5
   sigma, bull +1.5 sigma (log space).
3. Modifiers shift probabilities from the 25/50/25 prior and can widen tails,
   each recorded with direction, size, and a note: market regime (+/-6),
   own-history valuation band (+/-6 at the deciles), dilution pressure
   (MC/FDV under 0.6: bear +5 and widened), trend structure (+/-4), pending
   high-impact dated decisions (both tails widened).
4. Probabilities clamp to 5-60 and always sum to 100 (base absorbs the
   remainder). Expected range is the probability-weighted blend.

## Data touched

Pure function over the price/TVL series plus context. Results embed in the
report payload.

## Business rules / security

- Fan chart bands render behind the historical line; the y axis is log scale
  so wide cones stay readable.
- Every trajectory view carries the decision-support disclaimer and states
  that calibration logging is not wired yet.

## Edge cases

- Short histories: insufficientHistory true, no horizons, UI explains the 180
  day requirement (chain reports without a native token hit this path for
  price while TVL still computes).
- Extreme modifier stacks cannot push a probability below 5% or above 60%.

## Non-goals

Calibration logging (trajectory_logs in the plan) and the catalyst calendar
modifier fed by a real roadmap tracker are designed but not wired. News
momentum as a modifier is deliberately absent until the news engine exists.

## Tests

lib/report/__tests__/trajectory.test.ts covers ordering, probability sums,
each modifier's direction, tail widening, and the insufficient-history path.
E2e TL-011 covers horizon switching.
