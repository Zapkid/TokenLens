# TokenLens MVP test plan

Case ids are referenced by the Playwright specs in e2e/ (tagged in test
titles) and mapped to vitest suites for pure logic. Scenario families per the
working agreement: happy path, permission/trust boundaries, dedupe and
idempotency, edge cases. This file is the test-management record until Qase
is wired for the project.

## Environment

E2e runs against a production build with TOKENLENS_DATA_MODE=fixture:
deterministic synthetic data, network-free, and every report visibly labeled
synthetic. Unit tests run in node (jsdom for component tests).

## Home and search

| Case | Scenario | Automated by |
|---|---|---|
| TL-001 | Home renders regime banner, trending strip, search input | e2e/home-search.spec.ts |
| TL-002 | Typeahead resolves a token and opens its report (happy path) | e2e |
| TL-003 | Ticker collision (LUNA vs LUNC) shows disambiguation, never a silent match | e2e |
| TL-004 | Exact chain name ranks the chain report first (ETH vs Ethereum) | e2e |
| TL-005 | Library lists 10 + 10 cards; a card opens a report | e2e |

## Report

| Case | Scenario | Automated by |
|---|---|---|
| TL-010 | Token report renders all seven sections, numeric scores, grade A-E, quadrant, fixture badge | e2e/report.spec.ts |
| TL-011 | Trajectory horizon switch (3/6/12m) changes scenario ranges | e2e |
| TL-012 | Watchlist toggle persists (localStorage) and surfaces on home | e2e |
| TL-020 | Chain report adds Network section, nested token analysis, TVL trajectory | e2e |
| TL-021 | Chain without native token (Base): warning, token sections omitted, no forced scores | e2e |
| TL-022 | Unknown asset id: failure card, never a fabricated report | e2e |

## Settings

| Case | Scenario | Automated by |
|---|---|---|
| TL-030 | Weight slider re-scores the last viewed report live; reset restores defaults exactly | e2e |

## Portfolio

| Case | Scenario | Automated by |
|---|---|---|
| TL-040 | Add position via typeahead, valuation and P/L, tier drift flagged, trim suggestion, persistence across reload, removal | e2e/portfolio-compare.spec.ts |

## Compare

| Case | Scenario | Automated by |
|---|---|---|
| TL-050 | Two viewed reports compare with radars and score table | e2e |
| TL-051 | Empty shelf explains how to obtain comparable reports | e2e |

## Unit and component coverage (vitest)

| Suite | Covers |
|---|---|
| lib/__tests__/math.test.ts | Returns, volatility, drawdown, SMA, percentiles, winsorization, correlation |
| lib/report/__tests__/scoring.test.ts | Band interpolation, grades, quadrants, the plan appendix worked example, null-pillar renormalization, dampener per profile, weight direction, risk reasons |
| lib/report/__tests__/trajectory.test.ts | Probability sums, band ordering, every modifier direction, tail widening, insufficient history |
| lib/report/__tests__/strategy.test.ts | Tier gates, DCA scaling and schedules, allocation math, drift band edge, single-alt cap, unpriced/unclassified honesty |
| lib/report/__tests__/regime.test.ts | Risk-on/off/neutral reads, missing-data resilience |
| lib/report/__tests__/pipeline.test.ts | Full fixture generation for token/chain/no-native-token, cache TTL and refresh (idempotency), determinism, unknown-asset rejection |
| lib/providers/__tests__/fixture.test.ts | Seeded determinism, search ranking and collisions, library ranking |
| lib/__tests__/compare.test.ts | Radar data shape, fixed color slots, null flagging, 4-series cap, rescoring direction |
| components/portfolio/__tests__/PositionForm.test.tsx | Typeahead render, validation gating, submit persistence and reset |

## Known gaps (documented, not hidden)

- Live-provider integration is untested in CI by design (no egress in the
  build sandbox; conservative Actions usage). Manual verification checklist:
  run `npm run dev` with egress, search "solana", open token and chain
  reports, confirm non-fixture badge absence and populated metrics.
- Print/PDF output is visually verified manually (print stylesheet).
- No load or rate-limit tests: single-user tool on free API tiers.
