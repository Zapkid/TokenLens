# Arbitrum course project page (/arb)

## Summary

A bilingual research hub for the Blockchain Expert final project (cohort
14), Arbitrum (ARB) track. It presents the course guidelines, key facts, a
sourced timeline, live token and network data, and an answer to every
common question (Part A, chapters 1 to 7 plus the bonus) and every
Arbitrum-specific question (Part B, B.1 to B.5). The course's dedicated
questions for the other four projects (TON, Optimism, Ondo, Zcash) are
deliberately excluded. English is the default; a button switches the whole
page to Hebrew (RTL). A second button downloads the full paper as a Word
file in the current language, formatted to the submission rules (Arial,
12 pt, 1.5 line spacing).

Each answer carries a kind badge:

- **Fact-based**: answered from cited sources.
- **Analysis to defend**: a reasoned position built on the cited facts that
  the student must be able to defend in the interview (for example 1.5,
  4.3, 7.2).
- **Needs your input**: questions that require the student's own
  participation (3.2 screenshots, 3.3 experience, 3.4 LinkedIn post, the
  bonus transaction). The page gives guidance and a draft, never a
  fabricated experience.

## Entry Points

- Route: `app/(site)/arb/page.tsx` (inside the TokenLens shell; linked from
  the nav as "Arb"; listed in the sitemap and llms.txt).
- UI: `components/arb/ArbPage.tsx` (client: language state, live fetch,
  download) and `components/arb/ArbTrendChart.tsx` (recharts, indexed
  price vs TVL vs stablecoins).
- Live data API: `GET /api/arb` (`app/api/arb/route.ts`), same rate limit,
  version header and RFC 9457 error conventions as the rest of the API.
- Markdown rendition: `Accept: text/markdown` on /arb returns the English
  Q&A (`lib/arb/markdown.ts`, wired in `lib/agent-content.ts`).
- Content and logic (pure, unit tested), all under `lib/arb/`:
  - `types.ts`: bilingual content model.
  - `content/`: chapters (`part-a1.ts`, `part-a2.ts`, `part-b.ts`), guidelines, key facts, timeline, research date (`index.ts`).
  - `sources.ts`: one registry of cited sources.
  - `i18n.ts`: UI strings, language parsing, date formats.
  - `live.ts`: upstream parsers, fetchers, fixture.
  - `live-format.ts`: live data as labeled, sourced facts, shared by the page and the Word export.
  - `doc-model.ts` and `docx.ts`: the Word outline and its rendering.

## Flow(s)

1. Visitor opens /arb. The page renders in English (`dir="ltr"`) unless
   `?lang=he` is in the URL or the visitor previously chose Hebrew
   (`localStorage` key `tokenlens:v1:arb-lang`).
2. The client calls `/api/arb`. While loading, the live panel says so;
   on success it shows metric tiles with source links and a "Checked"
   timestamp; on failure it says live data is unavailable and every
   static answer stays intact.
3. Clicking the language button flips text, direction and `lang` for the
   whole page, writes the choice to `localStorage`, and updates the URL
   (`?lang=he`, removed for English) without a reload.
4. Clicking "Download Word" lazy-loads `doc-model` and `docx`, builds the
   paper in the current language (cover page, guidelines, all questions in
   course order with numbers, a live snapshot with check time and sources
   under each question that has live slots, the timeline under 2.1, and a
   deduplicated source list), and saves `Arbitrum-final-project-EN.docx` or
   `Arbitrum-final-project-HE.docx`.

## Data Touched

- Upstream reads (server side, `/api/arb`): CoinGecko `coins/arbitrum` and
  `market_chart` (365 days), DefiLlama `v2/historicalChainTvl/Arbitrum`,
  `v2/chains` (Arbitrum, Base, OP Mainnet), `summary/fees/arbitrum`,
  stablecoins.llama.fi `stablecoincharts/Arbitrum`, and GitHub commits for
  the last 30 days in `OffchainLabs/nitro`, `OffchainLabs/nitro-contracts`
  and `OffchainLabs/stylus-sdk-rs` (up to 5 pages of 100 per repository;
  counts shown with "+" when capped).
- Cache: in-process TTL cache, 15 minutes for the bundle, 6 hours for
  GitHub.
- Browser: `localStorage["tokenlens:v1:arb-lang"]` (language preference
  only). It sits in the app storage namespace, so the Settings export and
  erase cover it.
- No database or stored config changes.

## Business Rules / Security

- Facts only: every fact or analysis answer cites at least one source; the
  research date (`ARB_RESEARCH_DATE`) is shown on the page and in the Word
  file, and every live number carries its source and fetch time, as the
  course requires for numeric data.
- Upstream blocks fail independently (`Promise.allSettled`); `errors`
  names the failed blocks and the page hides only those tiles. Parsers
  throw on missing core fields instead of inventing values.
- Fixture mode (`TOKENLENS_DATA_MODE=fixture`) returns deterministic
  synthetic data that the UI and the Word export label as synthetic.
- `GITHUB_TOKEN` (optional, server-side only, never `NEXT_PUBLIC_`)
  raises the GitHub rate limit; `COINGECKO_API_KEY` reuses the existing
  CoinGecko configuration.
- Word typography: Arial for ASCII and complex script, 24 half-points
  (12 pt) for both, line 360 (1.5 spacing) on every paragraph; headings
  are bold 12 pt so no other size appears. Hebrew sets paragraph bidi and
  run RTL.
- Copy contains no em dashes (unit tested).

## Edge Cases

- Live data down: static content, timeline and Word export still work; the
  Word file simply omits the live snapshot lines.
- Partial upstream failure: only the affected tiles disappear.
- Charts stay LTR on the Hebrew page (axes and dates read left to right).
- Private browsing or blocked storage: the language toggle still works in
  memory.
- Download failure (for example a blocked blob URL) shows an inline
  retry message.

## Non-Goals

- No answers to the dedicated questions of TON, Optimism, Ondo or Zcash.
- No fabricated community participation, screenshots or transaction
  hashes; those stay the student's work.
- No server-side document rendering or storage of generated files.
- Not financial advice; the investment rating in 7.2 is a suggested,
  defended position for the student to adopt or change.

## Updating the content

Static answers live in `lib/arb/content/`. When facts change, update the
answer in both languages, cite the source in `lib/arb/sources.ts`, and bump
`ARB_RESEARCH_DATE`. The content unit tests enforce course order, both
languages, sources, and the no em dash rule.
