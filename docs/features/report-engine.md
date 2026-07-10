# Report engine

## Summary

One pipeline generates every report on demand: fetch raw data in parallel,
compute the metric catalog against a peer cohort fetched at generation time,
score pillars, run the trajectory engine, and cache the result for 24 hours.
Chain reports are the native token analysis plus a Network layer; the library
is the same pipeline triggered from a list instead of a search.

## Entry points

- Page: app/report/[type]/[id]/page.tsx (server component, calls the pipeline
  directly; ?refresh=1 busts the cache).
- API: GET /api/report?type=&id=&refresh= for programmatic access.
- Pipeline: generateReport() in lib/report/pipeline.ts.

## Flow

1. Fetch market snapshot (regime inputs), token data, and chain data (for
   chains) in parallel from the active provider.
2. Fetch the peer cohort (market-cap band from the top 250; full chain list
   for chains).
3. Build the metric catalog (lib/report/metrics.ts): market, supply,
   development, price behavior families for any token; a network family for
   chains. Fat-tailed metrics are log-transformed before percentile ranking.
4. Build pillars and scores (lib/report/scoring.ts), trajectory
   (lib/report/trajectory.ts), events, and strategy guidance.
5. Assemble the Report payload (lib/types.ts) including the cohort snapshot,
   pillar sub-scores, warnings, data mode, and review tier; cache it keyed by
   (type, id, data mode) with a 24h TTL.

## Data touched

In-process report cache only. The full payload is also saved client side to
the localStorage shelf when viewed (for Compare and the freshness panel).

## Business rules / security

- Reports must be honest about gaps: pillars without data are excluded and
  weights renormalize; missing history yields "insufficient history" rather
  than a forced score; every report shows its data mode (live or fixture) and
  review tier (auto-baseline).
- Fixture-mode reports carry a visible "Synthetic fixture data" badge.
- The server computes scores with default weights; clients recompute live
  from the shipped pillar sub-scores, so stored reports stay interpretable
  when weights change (weightsVersion is stored).

## Edge cases

- Chain without a native token: network section renders, token sections are
  omitted, a warning explains why (TL-021).
- Unknown asset ids reject with an error card (TL-022).
- Short-history assets: trajectory declares insufficient history (unit
  covered).
- Provider partial failures (fees endpoint down, no stablecoin data): the
  affected metrics go null and render as "n/a"; generation does not abort.

## Non-goals

No persistent report store or cross-device history in this build. On
serverless deploys the in-process cache is per instance; a durable cache
(Supabase per the plan) is the upgrade path.

## Tests

lib/report/__tests__/pipeline.test.ts (token, chain, no-native-token, cache
TTL, determinism, unknown assets); TL-010, TL-020, TL-021, TL-022 (e2e).
