# Arbitrum course project page (/arb)

## Summary

A bilingual research and learning hub for the Blockchain Expert final
project (cohort 14), Arbitrum (ARB) track. It answers every common question
(Part A, chapters 1 to 7 plus the bonus) and every Arbitrum-specific
question (Part B, B.1 to B.5); the course's dedicated questions for the
other four projects (TON, Optimism, Ondo, Zcash) are deliberately excluded.
English is the default; a button switches the whole page to Hebrew (RTL).
A second button downloads the paper as a Word file in the current
language, formatted to the submission rules (Arial, 12 pt, 1.5 spacing).

The page is split into clearly marked sections. Every section header
carries a colored kind tag, explained by a legend under the title:

| Kind | Sections | Meaning |
|---|---|---|
| Course brief | Course guidelines | The official rules, summarized |
| Your work | Your plan | A step checklist to finish the project, with target dates; progress persists in the browser |
| Static, verified | Key facts, History explorer, Roadmap | Researched facts, each with a verification badge and source |
| Live data | Live data (with data quality checks) | Fetched at request time, each tile with source and check time |
| Learning | Learn and practice | Glossary tied to course questions, interview practice cards |
| Course answers | Part A, Part B | The answers, each with a kind badge and sources |

Answer badges: **Fact-based** (cited sources), **Analysis to defend** (a
reasoned position the student must own in the interview, such as 1.5, 4.3,
7.2) and **Needs your input** (3.2, 3.3, 3.4 and the bonus: guidance and
drafts, never a fabricated experience).

## Entry Points

- Route: `app/(site)/arb/page.tsx` (inside the TokenLens shell; nav link
  "Arb"; in the sitemap and llms.txt).
- UI (client): `components/arb/ArbPage.tsx` (language, live fetch, download,
  section nav, answers), `components/arb/parts.tsx` (section frame, kind
  tags, fact tiles, verification and check badges),
  `components/arb/sections/LiveSection.tsx` (tiles, chain table, ETHBEAT
  risks, trend chart, data quality), `sections/HistorySection.tsx` (history
  explorer and roadmap), `sections/LearnSection.tsx` (glossary, practice
  cards, plan), `components/arb/ArbTrendChart.tsx` (indexed price vs TVL vs
  stablecoins with numbered history markers).
- Live data API: `GET /api/arb` (`app/api/arb/route.ts`), same rate limit,
  version header and RFC 9457 errors as the rest of the API.
- Markdown rendition: `Accept: text/markdown` on /arb returns history,
  roadmap and the English Q&A (`lib/arb/markdown.ts`).
- Content and logic (pure, unit tested) under `lib/arb/`:
  - `types.ts`: bilingual content model, verification metadata.
  - `content/`: answers (`part-a1.ts`, `part-a2.ts`, `part-b.ts`), key facts and research date (`facts.ts`), eras and events (`history.ts`), roadmap (`roadmap.ts`), glossary, practice cards and steps (`learn.ts`), guidelines and index (`index.ts`).
  - `sources.ts`: one registry of cited sources.
  - `live.ts`: upstream parsers, fetchers, fixture.
  - `verify.ts`: data validity checks.
  - `live-format.ts`: live data as labeled, sourced facts, shared by page and Word export.
  - `doc-model.ts` and `docx.ts`: the Word outline and its rendering.
  - `i18n.ts`: UI strings, language parsing, date formats.

## Flow(s)

1. Visitor opens /arb in English (`dir="ltr"`) unless `?lang=he` is set or
   Hebrew was chosen before (`localStorage["tokenlens:v1:arb-lang"]`).
2. The client calls `/api/arb`; the live section shows loading, then grouped
   tiles (token and market, usage and money, security and value secured,
   development), the Arbitrum ecosystem and competitor table (stage, Total
   Value Secured, DeFi TVL), ETHBEAT's risk summary, the 12 month indexed
   trend with history markers, and the data quality checks. On failure the
   live section says so and everything static stays intact.
3. The history explorer filters 26 events by category, groups them by era,
   and expands each into detail, "why it mattered", verification badge,
   source and links to the course questions it helps answer. Events used
   for question 2.1 are marked.
4. The plan checklist stores ticked steps in
   `localStorage["tokenlens:v1:arb-steps"]`.
5. "Download Word" lazy-loads the doc model and `docx`, then saves
   `Arbitrum-final-project-EN.docx` or `-HE.docx`: cover page, guidelines,
   every question in order with live snapshots under the questions that
   use live data, the 2.1 timeline, a data quality appendix (when live data
   loaded) and a deduplicated source list.

## Data Touched

- Upstream reads (server side, `/api/arb`, all independent):
  - CoinGecko `coins/arbitrum` (price, supply, ATH, `last_updated`) and `market_chart` (365 days).
  - DefiLlama `v2/historicalChainTvl/Arbitrum`, `v2/chains` (Arbitrum, Robinhood Chain, Arbitrum Nova, Base, OP Mainnet), `summary/fees/arbitrum`.
  - stablecoins.llama.fi `stablecoincharts/Arbitrum` (circulating, natively minted, bridged in).
  - ETHBEAT (formerly L2BEAT; l2beat.com redirects to ethbeat.org) `api/scaling/summary`: stage, Total Value Secured breakdown (canonical, native, external, stablecoin) and risk summary for Arbitrum One, Robinhood Chain, Nova, Base and OP Mainnet.
  - GitHub: the most recently pushed public OffchainLabs repositories (always nitro and nitro-contracts, up to 6), commits in the last 30 days (up to 3 pages of 100 each; "+" when capped), plus the latest nitro release.
- Cache: in-process TTL, 15 minutes for the bundle, 6 hours for GitHub.
- Browser: `tokenlens:v1:arb-lang` and `tokenlens:v1:arb-steps`, inside the
  app storage namespace so the Settings export and erase cover them.
- No database or stored config changes.

## Business Rules / Security

- Facts only. Every static fact carries a verification status, shown as a
  badge: verified in a primary source (docs, forum post, ETHBEAT,
  DefiLlama, CoinGecko, git history), secondary source, derived (with the
  computation), or sources disagree (with which value is used and why).
  `ARB_RESEARCH_DATE` is shown on the page and in the Word file.
- Data quality checks (`lib/arb/verify.ts`), recomputed on every load:
  internal consistency (market cap vs price times circulating supply; spot
  vs chart), cross-source agreement (two DefiLlama TVL endpoints; DefiLlama
  vs ETHBEAT stablecoins, with the methodology difference explained),
  freshness (CoinGecko timestamp, DefiLlama daily series), static drift
  (live ETHBEAT stage vs the answers' "Stage 1"; live ATH vs $2.39; total
  supply still 10B, else answer 5.1 must change), and coverage (warns when a
  repository's default branch is silent, since one repository understates
  activity). Missing inputs are "Not checked", never guessed.
- Upstream blocks fail independently; parsers throw on missing core fields
  instead of inventing values. Fixture mode (`TOKENLENS_DATA_MODE=fixture`)
  returns deterministic synthetic data labeled as such in UI and Word.
- `GITHUB_TOKEN` (optional, server-side only) raises the GitHub rate limit;
  CoinGecko reuses the existing key configuration.
- Word typography: Arial (ASCII and complex script), 24 half-points (12 pt)
  everywhere, line 360 (1.5 spacing); Hebrew sets paragraph bidi and run RTL.
- Copy contains no em dashes (unit tested).

## Verification log (18 Nov 2026)

Checked against primary sources reachable from the TokenLens cloud
environment (DefiLlama, CoinGecko, ETHBEAT, Arbitrum docs and forum, git):

- Corrected: the Binance exploit funds frozen on 30 Oct 2026 can only be
  moved by a DAO vote (not further council action); the council used an
  atomic Inbox upgrade on Ethereum.
- Added: a first freeze on 21 Apr 2026 (30,765.67 ETH, KelpDAO exploiter).
- Corrected: July 2026 key rotation (Gauntlet resigned; John Morrow removed
  for lack of a resignation mechanism; Patrick Collins appointed; Certora
  rotated its representative). March 2026 winners confirmed: Lewellen,
  DZack23, yoav.eth, Certora, bartek.eth, Pablo Sabbatella.
- Added: Timeboost (April 2025) was replaced by PGA and a paid Fast Feed in
  2026; 3% of ordering revenue goes to the Developer Guild.
- Added: Stylus Activation Contract AIP (23 Oct 2026); known Stylus bugs
  affected liveness, not funds.
- Changed: on-chain voting moved from Tally (wound down) to the Foundation's
  governance portal; L2BEAT is now ETHBEAT.
- Corrected: B.5 no longer claims adoption kept growing. Live data shows
  stablecoins on Arbitrum fell from a $10.6B peak (Oct 2025) to about $4.2B,
  mostly in May to June 2026 when Hyperliquid left its Arbitrum bridge.
- Confirmed live: Arbitrum One Stage 1 with exit window "None"; Robinhood
  Chain and Nova Stage 0; ARB total supply 10B, 70% circulating.

## Edge Cases

- Live data down: static content, history, roadmap, plan, learning aids
  and Word export still work; the Word file omits live snapshots and the
  data quality appendix.
- GitHub unreachable (for example in sandboxes whose proxy blocks the
  GitHub API): only the development tiles and the coverage check are
  skipped.
- Partial dates: history events keep their precision (year, month or day);
  chart markers place month-only events mid-month and skip year-only ones.
- Charts stay LTR on the Hebrew page.
- Blocked storage: language and plan still work for the visit.
- Node outside Vercel behind a proxy needs `NODE_USE_ENV_PROXY=1` for the
  built-in fetch to reach upstreams.

## Non-Goals

- No answers to the dedicated questions of TON, Optimism, Ondo or Zcash.
- No fabricated community participation, screenshots or transaction hashes.
- No single "official" roadmap: Arbitrum publishes none; items are
  assembled from upgrade notices, AIPs and Foundation updates.
- Not financial advice; ratings in 4.3 and 7.2 are suggested, defended
  positions for the student to adopt or change.

## Updating the content

Static content lives in `lib/arb/content/`. When facts change, update both
languages, cite the source in `lib/arb/sources.ts`, set the verification
status, and bump `ARB_RESEARCH_DATE`. A failing static-drift check on the
page (stage, ATH, total supply) is the signal that an answer is stale. The
content tests enforce course order, both languages, sources, valid question
cross-references, sorted history and the no em dash rule.
