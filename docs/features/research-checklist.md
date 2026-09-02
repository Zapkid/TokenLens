# Research checklist

## Summary

A guided fundamental research checklist rendered at the bottom of every token
and chain report, adapted into English from the BDCC (the Blockchain and
Digital Currencies College) fundamental research and coin analysis checklist.
It structures the manual due diligence the automated report cannot do: three
stages (first impression, deep research, summary), fifteen sections, and per
item a 1 to 5 score plus a free-text note. Items the report already knows
about (market cap, supply caps, turnover, dilution overhang, GitHub activity,
chain ecosystem breadth and fees) pre-fill automatically from the report's own
metrics with a labeled basis and a suggested score the user can override.
Section averages roll up into a stage 3 summary: an overall 1 to 5 verdict,
completion count, and a stage 1 gate that says whether the first impression
justifies continuing to deep research. Answers persist per asset in this
browser only.

## Entry Points

- Rendered inside every report at `/report/[type]/[id]` as the last section,
  by `components/report/ResearchChecklist.tsx` (client), mounted from
  `components/report/ReportView.tsx`.
- Catalog, rollup math, and persistence types: `lib/research/checklist.ts`.
- Auto answers from report metrics: `lib/research/autofill.ts`.
- Persistence hook: `useResearchRecords()` in `lib/storage.ts`, stored under
  the `tokenlens:v1:research` key as a record keyed `${type}:${id}`.

## Flow(s)

1. A report renders. `buildAutoAnswers(report)` derives auto answers from the
   metric catalog: display text, a basis line naming the source, and a
   suggested 1 to 5 score where a judgment is defensible (band anchors reuse
   the same shapes as `lib/report/scoring.ts`). Informational rows (ticker,
   circulating supply, ATH distance) carry no suggestion.
2. The user opens a section (collapsed by default), scores items 1 to 5, and
   writes notes. A manual score always overrides the auto suggestion; clicking
   the same score again clears it. Auto suggestions render as a dashed button
   until confirmed or overridden.
3. Every change writes the asset's `ResearchRecord` to localStorage through
   the shared storage layer, so the record survives reloads and report
   refreshes.
4. The summary strip recomputes live: per-section averages, the overall
   average across scored sections, answered count, and the stage 1 gate.
   The gate needs at least half of the stage 1 sections scored; then a stage 1
   average at or above 3 reads "continue research", below 3 reads "stop here".
5. Printing the report includes the checklist state: notes swap from inputs to
   static text via the print stylesheet.

## Data Touched

- Reads the `Report` payload only (metrics and asset identity). No new API
  calls and no server involvement.
- Writes `tokenlens:v1:research` in localStorage:
  `Record<"${type}:${id}", { updatedAt, answers: Record<itemKey, { score?, note? }> }>`.
  Keys are stable identifiers; renaming an item key orphans stored answers,
  so treat catalog keys as persisted schema.

## Business Rules / Security

- Manual judgment beats derived data: the effective score of an item is the
  manual score when set, else the auto suggestion, else null. Null items are
  excluded from averages, mirroring how pillar scoring renormalizes.
- Every auto row labels its basis (for example "1 - MC/FDV, an approximation
  of unlock overhang") so a proxy is never mistaken for a verified fact.
- Chain-only rows (ecosystem breadth, network fees) simply stay manual on
  token reports; nothing is faked for missing data.
- The checklist does not feed the automated pillar scores. Opportunity, risk,
  and overall stay purely data-driven; the checklist is the parallel human
  layer. Wiring a completed checklist into the narrative or legal pillars is a
  designed follow-up, not part of this build.
- Research notes never leave the browser: no server sync, no export, nothing
  in the personal sync document. This keeps free-text research notes out of
  any server store by default.
- Copy contains no em dashes (unit-tested for the catalog).

## Edge Cases

- No answers at all: overall and stage averages show n/a and the gate reads
  as locked rather than defaulting to a verdict.
- Reports with partial data (for example a token without developer data, or a
  chain without a native token) pre-fill only what exists; everything else is
  manual.
- Scoring only stage 2 leaves the stage 1 gate locked: deep research effort
  does not retroactively justify itself.
- localStorage full or blocked: state stays in memory for the session, same
  behavior as the watchlist.

## Non-Goals

- No server-side persistence or personal sync of research records in this
  build.
- No export of checklist answers with the JSON/CSV report export.
- No feedback loop into the automated scores.
- No Hebrew UI: the product surface is English; the source methodology is
  credited, not embedded verbatim.
