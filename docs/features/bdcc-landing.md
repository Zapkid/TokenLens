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
- Layout: /bdcc lives outside the `app/(site)/` route group that carries
  the TokenLens shell (nav, width-capped main, attribution footer), so it
  renders full-viewport directly under the root layout. Section
  backgrounds bleed edge to edge on any screen; content inside each
  section is centered in a max-w-6xl container.
- Rendering and interactions: `components/bdcc/BdccLanding.tsx` (client)
  with its effect styles in `components/bdcc/bdcc.module.css`.
- Content, palette, and link helpers: `lib/bdcc.ts`. Pure animation math
  (scramble frames, tilt, magnetism, count-up easing): `lib/bdcc-fx.ts`.
- Ads and analytics: `components/bdcc/BdccAnalytics.tsx` (consent banner
  plus tag loading) over `lib/analytics.ts` (ids, consent storage,
  Consent Mode payloads, cross-network event fan-out).
- SEO plumbing shared with the app: `app/robots.ts`, `app/sitemap.ts`,
  `lib/site.ts` (canonical origin), `metadataBase` in the root layout.

## Flow(s)

1. Visitor opens /bdcc. The page renders standalone (no TokenLens nav or
   footer) with scoped BDCC palette tokens, `dir="rtl"` and `lang="he"`,
   filling the full viewport at every screen size.
2. Sections in order: top bar (logo plus "לאתר הרשמי" button), hero with two
   CTAs, stats strip, three course cards, about, contact footer.
3. Course cards and the primary CTA open the matching page on
   www.bdcc.co.il in a new tab (`rel="noopener noreferrer"`). Contact links
   use normalized `tel:` and `mailto:` hrefs built by `telHref`/`mailHref`.
   The secondary hero CTA scrolls to the lead form (#lead).
4. Conversion layer (modeled on the official site):
   - Gold urgency announcement bar above the header linking to the courses
     page.
   - Cohort scarcity strip for the Blockchain Expert track: full cycles are
     dimmed, exactly one "few spots left" cycle carries a pulsing
     "הרשם עכשיו!!" CTA, the next cycle shows enrollment open.
   - Vimeo promo embed (lazy iframe) and a six-photo gallery served through
     the Next image optimizer (same-origin URLs, cached and resized, no
     hotlink referrer issues; the CDN host is allow-listed in
     next.config.ts). Images fade in on load, with descriptive Hebrew alt
     text, and fall back to a quiet branded tile on error. The optimizer
     onLoad also covers images that finish before hydration, which is what
     previously left loaded photos invisible.
   - Lead form ("בדיקת התאמה"): name, phone, email, track radios, and a
     marketing-consent checkbox. Validation is client side
     (lib/bdcc.ts isValidLead); a valid submit opens a prefilled mailto
     draft to support@bdcc.co.il (buildLeadMailto) and shows a success
     note with the same link. Nothing is stored server side.
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
- The lead form never stores or transmits lead details to any server: the
  visitor's own mail client carries them. Cohort statuses and the
  announcement are demo content modeled on the official site; refresh them
  from bdcc.co.il when cycles change.
- No fabricated testimonials, graduate counts, or guarantees: social proof
  sticks to verifiable facts (founded 2017, CryptoJungle, official
  certification).
- The Blockchain Expert funnel (course card, cohort CTA, announcement bar)
  links to bdcc.co.il/blockchain-expert-course.
- SEO: per-page title, description, canonical, Open Graph and Twitter
  cards (he_IL locale, gallery image), JSON-LD EducationalOrganization
  with the three Course offers, plus robots.txt and sitemap.xml.
- Accessibility: scramble animations are aria-hidden with sr-only real
  text, the ticker marquee is decorative (aria-hidden), form fields carry
  labels, autocomplete, and role=alert/status messages, keyboard focus
  gets a visible gold ring, and all motion respects
  prefers-reduced-motion.
- Security headers (site-wide via next.config.ts): nosniff, SAMEORIGIN
  framing, strict-origin-when-cross-origin referrer, Permissions-Policy
  lockdown, HSTS. An enforced CSP is deliberately omitted so ad and
  analytics tags cannot be silently broken; revisit once the final tag
  set is stable.
- Ads and analytics readiness: tag ids come from NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_X_PIXEL_ID
  (public identifiers, not secrets; nothing renders when unset). Google
  tags bootstrap with Consent Mode v2 defaults denied; Meta and X pixels
  load only after the visitor accepts the Hebrew consent banner, and the
  choice persists in localStorage. Conversion events: generate_lead on a
  valid form submit, select_promotion on announcement and cohort CTAs,
  select_content on the hero CTA.
- No em dashes in any copy, per the repo-wide rule (unit-tested).
- System font stack only: `next/font/google` would try to download fonts at
  build time, which the sandbox egress policy blocks.

## Edge Cases

- RTL inside an LTR app shell: the page root sets `dir` and `lang` locally;
  phone, email, URL fragments, and the marquee are wrapped with `dir="ltr"`
  so they do not render mirrored.
- Mobile: the stats grid collapses to one column. Desktop: sections bleed
  full width while text and cards stay in a centered max-w-6xl column, and
  the hero headline scales up (lg:text-6xl). The root uses min-h-dvh and
  overflow-x-clip so no section can cause sideways scroll.
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
