# BDCC landing page

## Summary

A standalone, Hebrew, right-to-left landing page at /bdcc that presents BDCC
(המכללה לבלוקצ'יין ומטבעות דיגיטליים, the Blockchain and Digital Currency
College from CryptoJungle) in its own brand look: deep navy surfaces with
gold accents and a recreated BDCC block-motif logo. Every call to action
links out to the official site, https://www.bdcc.co.il.

## Entry Points

- Route: `app/bdcc/page.tsx` (server component, static). The page is not
  linked from the TokenLens nav; it is reached directly at /bdcc.
- Content, palette, and link helpers: `lib/bdcc.ts`.

## Flow(s)

1. Visitor opens /bdcc. The page renders inside the app shell but overrides
   the theme with scoped BDCC palette tokens, `dir="rtl"` and `lang="he"`.
2. Sections in order: top bar (logo plus "לאתר הרשמי" button), hero with two
   CTAs, stats strip, three course cards, about, contact footer.
3. Course cards and the primary CTA open the matching page on
   www.bdcc.co.il in a new tab (`rel="noopener noreferrer"`). Contact links
   use normalized `tel:` and `mailto:` hrefs built by `telHref`/`mailHref`.

## Data Touched

- None. No API routes, no storage, no client state. All copy is a static
  content model in `lib/bdcc.ts` (`BDCC_CONTENT`), colors in
  `BDCC_PALETTE`.

## Business Rules / Security

- The palette is a documented approximation: the sandbox network policy
  blocks www.bdcc.co.il, so exact brand hex codes could not be sampled.
  All colors flow through `BDCC_PALETTE`, so swapping in confirmed values
  is a one-file change.
- The logo is recreated inline as SVG rather than hotlinking the official
  asset (same egress constraint, and no third-party requests at runtime).
- External links always carry `rel="noopener noreferrer"`.
- The footer states that the page is a demo pointing to the official site
  and that content rights belong to BDCC.
- No em dashes in any copy, per the repo-wide rule (unit-tested).
- System font stack only: `next/font/google` would try to download fonts at
  build time, which the sandbox egress policy blocks.

## Edge Cases

- RTL inside an LTR app shell: the page root sets `dir` and `lang` locally;
  phone, email, and URL fragments are wrapped with `dir="ltr"` so they do
  not render mirrored.
- Mobile: the stats grid collapses to one column; the page bleeds to the
  main container edges with negative margins.

## Non-Goals

- No lead-capture form, analytics, or backend integration.
- No copy of the official site's full content or imagery; this is a single
  referral landing page.
- Not added to the TokenLens navigation: it is a brand microsite page, not
  part of the analysis product.
