# TokenLens documentation index

Read [features-overview.md](features-overview.md) first for the one-page map.

## Feature docs

- [Search and resolution](features/search-and-resolution.md)
- [Report engine](features/report-engine.md)
- [Scoring system](features/scoring.md)
- [Research checklist](features/research-checklist.md)
- [Trajectory scenarios](features/trajectory.md)
- [Market regime indicator](features/market-regime.md)
- [Events and decision calendar](features/events-calendar.md)
- [Report library](features/report-library.md)
- [Compare](features/compare.md)
- [Portfolio and watchlist](features/portfolio-and-watchlist.md)
- [Strategy engine](features/strategy-engine.md)
- [Settings and methodology](features/settings-and-methodology.md)
- [Data providers and caching](features/data-providers-and-caching.md)
- [Mobile layout and PWA](features/mobile-and-pwa.md)
- [MCP connector](features/mcp-connector.md)
- [Personal sync and MCP personal tools](features/personal-sync.md)
- [BDCC landing page](features/bdcc-landing.md)
- [Onchain analytics with email OTP gate](features/onchain-analytics.md)
- [Agent readiness](features/agent-readiness.md)

## Reference snapshots

- [Supabase schema](reference/supabase-schema.md): current state of
  persistent storage after all migrations in supabase/migrations/.

## Test plans

- [MVP test plan](test-plans/tokenlens-mvp.md): case ids TL-001 and up,
  mirrored by the Playwright specs in e2e/ and the vitest suites in
  lib/**/__tests__/.

## Conventions

- UI selectors used by e2e tests live in one registry: lib/selectors.ts.
- Copy contains no em dashes anywhere (docs and code strings). Use periods,
  commas, or colons; en dashes only for numeric ranges.
- Every feature change updates its doc in the same PR.
