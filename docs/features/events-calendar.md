# Events and decision calendar

## Summary

A table of dated, resolvable events per report plus an aggregated strip on the
home page. The discipline: every entry has a date, a type, an impact rating,
and a scope. This build wires the macro calendar (FOMC decision dates,
published about a year ahead); the other feeds are designed, labeled gaps.

## Entry points

- lib/report/events.ts: buildEvents(asset, opts).
- lib/constants.ts: FOMC_DATES_2026.
- Rendered in the report's News and events section and the home decision
  strip.

## Flow

buildEvents filters the static FOMC schedule to the requested horizon and
returns typed DecisionEvent rows (macro, market scope, medium impact).
High-impact events inside a trajectory horizon widen scenario tails and are
named in the modifier notes.

## Data touched

Static constants only in this build.

## Business rules / security

- Only dated events qualify. Undated pressure (for example continuous
  emissions) belongs in risk pillars, not the calendar.
- The report states explicitly which feeds are not wired so an empty calendar
  is never mistaken for "nothing is happening".

## Edge cases

- The FOMC list is year-scoped (2026): past dates filter out, and an empty
  result renders an explicit empty state. Refreshing the list yearly is a
  documented maintenance chore.

## Non-goals (yet)

Governance votes (Snapshot/Tally), unlock cliffs, regulatory deadlines,
exchange events, pre-event alerts, and the review queue.

## Tests

Covered indirectly by trajectory tests (pending-decision modifier) and report
rendering e2e (TL-010 renders the section).
