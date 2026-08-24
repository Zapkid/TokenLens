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

## Mobile and PWA

| Case | Scenario | Automated by |
|---|---|---|
| TL-060 | Home, report, library, settings, portfolio have zero horizontal page overflow at iPhone viewport | e2e/mobile-pwa.spec.ts |
| TL-061 | Every nav destination reachable on a phone (nav scrolls within itself); settings sliders stay in-viewport | e2e |
| TL-062 | Manifest served with standalone display, 192/512 icons, and a maskable icon | e2e |
| TL-063 | Service worker, all icon files, and the offline fallback page are served | e2e |
| TL-064 | Service worker registers and reaches the active state on load | e2e |

## MCP connector

| Case | Scenario | Automated by |
|---|---|---|
| TL-065 | MCP initialize handshake succeeds and tools/list exposes exactly the five analysis tools | e2e/mcp.spec.ts |
| TL-066 | search_assets resolves an id that generate_report accepts; the summary carries scores, grade, disclaimer, and no chart series | e2e |
| TL-067 | Schema violations are rejected before any provider call; unknown asset ids return isError tool results, not protocol errors | e2e |
| TL-068 | compare_assets returns a per-asset score map and pillar matrix; get_market_regime returns a valid regime state with components | e2e |
| TL-069 | Static REST routes keep routing precedence over the dynamic MCP transport segment | e2e |

## Personal sync and MCP personal tools

| Case | Scenario | Automated by |
|---|---|---|
| TL-070 | /api/personal rejects missing and wrong bearer tokens (401) and accepts the configured one | e2e/personal.spec.ts |
| TL-071 | PUT applies newer documents, rejects stale ones with the newer state, and 400s malformed bodies | e2e |
| TL-072 | Personal MCP tools are listed but refuse calls without the bearer token | e2e |
| TL-073 | Watchlist round trip over MCP: add, read with quotes, remove | e2e |
| TL-074 | Portfolio round trip over MCP: multiple lots, valued analysis with P&L and tier allocation, remove clears all lots | e2e |
| TL-075 | Server personal state appears in the web UI after the token is configured in Settings | e2e |

## BDCC landing page

| Case | Scenario | Automated by |
|---|---|---|
| TL-076 | /bdcc renders the RTL Hebrew landing: root has dir=rtl, logo shows BDCC, hero visible, primary CTA points at bdcc.co.il/courses | e2e/bdcc.spec.ts |
| TL-077 | Exactly three course cards, each an external link into https://www.bdcc.co.il with rel noopener | e2e |
| TL-078 | Contact block exposes normalized tel: and mailto: links (tel:+972552828741, mailto:support@bdcc.co.il) | e2e |
| TL-079 | Link helpers: bdccUrl joins paths to the official origin, telHref strips formatting and keeps a leading +, mailHref trims; content has 3 courses and no em dashes; palette values are valid colors | lib/__tests__/bdcc.test.ts |

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
| lib/__tests__/mcp.test.ts | LLM projections: identity and score fidelity, null-pillar honesty, chart-series exclusion, network section gating, scenario probability sums, comparison matrix, regime rounding, portfolio P&L and unpriced honesty, watchlist quote joins |
| lib/server/__tests__/personal.test.ts | Personal store: token verification (constant time, unset means off), bearer parsing, document validation, memory backend round trip, last-write-wins puts, Supabase backend (PostgREST shapes, empty row, failure surfacing, precedence over Upstash), watchlist and position mutations |
| lib/__tests__/personal-sync.test.ts | Sync reconcile decisions: pull, push, noop, unparseable timestamp handling |
| lib/__tests__/bdcc.test.ts | BDCC landing helpers and content invariants: URL join, tel/mailto normalization, three courses, no em dashes, palette shape |
| components/portfolio/__tests__/PositionForm.test.tsx | Typeahead render, validation gating, submit persistence and reset |

## Known gaps (documented, not hidden)

- Live-provider integration is untested in CI by design (no egress in the
  build sandbox; conservative Actions usage). Manual verification checklist:
  run `npm run dev` with egress, search "solana", open token and chain
  reports, confirm non-fixture badge absence and populated metrics.
- Print/PDF output is visually verified manually (print stylesheet).
- No load or rate-limit tests: single-user tool on free API tiers.
