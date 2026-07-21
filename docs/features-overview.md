# TokenLens features overview

One engine, two report types, six surfaces. This page maps what exists in the
current build against the product plan, including what is deliberately not
wired yet.

## Surfaces

| Surface | Route | Status |
|---|---|---|
| Search / New report | / | Built: typeahead, disambiguation, regime banner, trending strip, decision calendar strip, watchlist chips |
| Report library | /library | Built: live top 10 tokens by MC (ex-stablecoins) and top 10 chains by TVL; membership recomputed, not hardcoded |
| The report | /report/[type]/[id] | Built: Overview, Network (chains), Stats, Risk, Potential, Trajectory, News and events, Strategy; print-based PDF; JSON/CSV export |
| Compare | /compare | Built: 2 to 4 saved reports, pillar radars, comparison table |
| Portfolio and watchlist | /portfolio | Built: manual positions, tier allocation vs template, drift-band rebalancing suggestions |
| Settings and methodology | /settings, /methodology | Built: weight editor with live re-scoring preview, risk profile, data freshness, written methodology |
| Mobile and PWA | all routes | Built: no sideways scroll on phones, installable manifest and icons, service worker with offline fallback |
| MCP connector | /api/mcp | Built: five public analysis tools (search, report, scenarios, compare, regime) over streamable HTTP for Claude and other MCP clients |
| Personal sync | /api/personal, /api/mcp | Built: token-gated server store for watchlist, positions, and tiers; web UI mirrors localStorage to it and six MCP personal tools read and mutate it |

## Engine modules (lib/)

| Module | Responsibility |
|---|---|
| providers/ | Data access. live (CoinGecko, DeFiLlama, alternative.me) and fixture (deterministic synthetic) implement one interface |
| report/metrics.ts | The defined metric catalog per family, with cohort percentiles |
| report/scoring.ts | Opportunity and risk pillars, weighted scores, grades, quadrant, dampener |
| report/trajectory.ts | Volatility cone plus visible modifiers, three scenarios, three horizons |
| report/regime.ts | Global risk-on / neutral / risk-off composite |
| report/strategy.ts | Tiers, DCA, exit ladders, portfolio analysis and rebalancing |
| report/events.ts | Decision calendar (macro dates wired; other feeds designed, not wired) |
| report/pipeline.ts | Orchestration and the 24h report cache |

## Deliberately not wired in this build (design intact, honest gaps)

- News signal engine (CryptoPanic, RSS): the Narrative pillar reports no data
  and weights renormalize rather than faking a neutral score.
- Verified unlock calendars: dilution risk uses the MC/FDV gap, labeled as an
  approximation.
- Governance (Snapshot/Tally), regulatory and legal feeds: the legal pillar is
  an auto baseline and says so on every report.
- Roadmap tracker and shipping-reliability score.
- Trajectory calibration logging (hit-rate tracking over time).
- Serverless PDF rendering: Download PDF uses the print stylesheet, which
  keeps the web report and the document identical by construction.
- Category-first peer cohorts: the cohort is a market-cap band from the top
  250; category matching is the designed refinement.

## Out of scope by design

Trade execution, exchange API keys, sub-daily data, memecoin rug screening,
tax reporting, multi-user features.
