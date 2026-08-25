# BDCC landing page

## Summary

A standalone, Hebrew, right-to-left landing page at /bdcc that presents BDCC
(המכללה לבלוקצ'יין ומטבעות דיגיטליים, the Blockchain and Digital Currency
College from CryptoJungle) in its own brand look: deep navy surfaces with
gold accents and a recreated BDCC block-motif logo. Every call to action
links out to the official site, https://www.bdcc.co.il.

## Entry Points

- Route: `app/bdcc/page.tsx` (thin server wrapper for metadata; static).
  The page is not linked from the TokenLens nav; it is reached directly at
  /bdcc.
- Rendering and interactions: `components/bdcc/BdccLanding.tsx` (client)
  with its effect styles in `components/bdcc/bdcc.module.css`.
- Content, palette, and link helpers: `lib/bdcc.ts`. Pure animation math
  (scramble frames, tilt, magnetism, count-up easing): `lib/bdcc-fx.ts`.

## Flow(s)

1. Visitor opens /bdcc. The page renders inside the app shell but overrides
   the theme with scoped BDCC palette tokens, `dir="rtl"` and `lang="he"`.
2. Sections in order: top bar (logo plus "לאתר הרשמי" button), hero with two
   CTAs, stats strip, three course cards, about, contact footer.
3. Course cards and the primary CTA open the matching page on
   www.bdcc.co.il in a new tab (`rel="noopener noreferrer"`). Contact links
   use normalized `tel:` and `mailto:` hrefs built by `telHref`/`mailHref`.
4. Interaction layer (Hyperplexed-style micro-interactions):
   - Course cards carry cursor-tracked glow borders: one mousemove pass
     over the grid sets `--mx`/`--my` on every card, so all borders light
     up around the cursor; the hovered card adds an inner spotlight and a
     small 3D tilt (`--rx`/`--ry`).
   - The hero has a faded background grid, a cursor-following gold
     spotlight, floating hexagon outlines, and a scramble-in headline; the
     second headline line shimmers with an animated gold gradient.
   - The BDCC wordmark scrambles in on load and again on hover.
   - CTA buttons are magnetic: they lean toward the cursor and spring back.
   - Stats count up (easeOutExpo) when scrolled into view; sections fade
     and rise in via IntersectionObserver.
   - A looping ticker marquee separates stats from courses; it pauses on
     hover and its duplicate copy is `aria-hidden`.

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
  phone, email, URL fragments, and the marquee are wrapped with `dir="ltr"`
  so they do not render mirrored.
- Mobile: the stats grid collapses to one column; the page bleeds to the
  main container edges with negative margins.
- Reduced motion: every JS effect checks `prefers-reduced-motion` before
  animating (scramble and count-up snap to their final text) and the CSS
  module disables all keyframe animations, reveals, tilt, and magnetism
  under the same media query.
- Hydration: scramble targets render as the real text on the server and
  only start animating after mount, so SSR output, crawlers, and
  hydration all see the final copy. Numeric stats server-render as "0"
  and count up on first view.

## Non-Goals

- No lead-capture form, analytics, or backend integration.
- No copy of the official site's full content or imagery; this is a single
  referral landing page.
- Not added to the TokenLens navigation: it is a brand microsite page, not
  part of the analysis product.
