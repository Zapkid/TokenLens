# Mobile layout and PWA

## Summary

The app is a responsive, installable Progressive Web App: no page scrolls
sideways on a phone, wide content scrolls inside its own container, and the
site ships a manifest, icons, and a service worker so it can be installed to
a home screen and opened standalone, with a graceful offline fallback.

## Entry points

- app/manifest.ts: generates /manifest.webmanifest (name, standalone display,
  theme colors, icon set including a maskable variant).
- public/sw.js: the service worker. public/icons/ and
  public/apple-touch-icon.png: install icons.
- components/PwaRegister.tsx: registers the worker (production builds only),
  mounted in app/layout.tsx.
- app/offline/page.tsx: the offline fallback page.
- app/layout.tsx: viewport export (device width, safe-area cover, light and
  dark theme colors) and Apple web app metadata.

## Flow

1. Layout: the body never scrolls horizontally. The nav scrolls within itself
   on narrow screens (scrollbar hidden, links non-shrinking); every wide
   table (stats, scenarios, events, tiers, compare) scrolls inside an
   overflow-x-auto wrapper; settings weight rows stack label-over-slider on
   phones; charts are responsive containers.
2. Install: the manifest plus 192/512 any-purpose icons and a 512 maskable
   icon satisfy Chromium installability; apple-touch-icon and Apple web app
   metadata cover iOS add-to-home-screen.
3. Service worker: cache-first for immutable build assets (/_next/static,
   icons), network-first for page navigations with the cached copy as
   fallback and /offline as the last resort. API and report data are never
   cached by the worker: reports are market data, and the app's server-side
   TTL cache owns that concern.

## Data touched

Browser cache storage (two versioned caches: static and pages). Bumping the
VERSION constant in sw.js invalidates both on the next activate.

## Business rules / security

- The worker only handles same-origin GET requests.
- Report and API responses are deliberately excluded from worker caching so
  a user can never mistake day-old cached scores for fresh ones offline; the
  offline page says exactly that.
- Registration is skipped outside production builds so dev hot reload stays
  honest.

## Edge cases

- Browsers without service worker support degrade to a plain web app.
- A failed registration is swallowed: install-ability is progressive
  enhancement, never a blocker.
- The events and compare tables set a min width inside their scroll wrappers
  so columns stay readable instead of crushing to one word per line.

## Non-goals

Push notifications, background sync, precached report payloads, and an
in-app "install" prompt button. The plan's alerts feature would revisit push.

## Tests

TL-060 to TL-064 in e2e/mobile-pwa.spec.ts: per-page horizontal overflow at
iPhone viewport, nav reachability on phones, manifest shape, served worker
and icons, offline page content, and active service worker registration.
