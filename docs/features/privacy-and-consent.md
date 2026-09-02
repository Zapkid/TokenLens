# Privacy and consent (GDPR)

## Summary

The site's data protection posture, built so a visitor in the EU or UK
gets what the GDPR and ePrivacy rules require without the site needing
accounts: a privacy notice that names the controller, purposes, legal
bases, retention, processors, and rights; a consent banner that loads no
third-party script until the visitor accepts and that can be withdrawn as
easily as it was granted; and self-service export and erasure of
everything the site holds, including the optional synced server copy.

## Entry Points

- `app/(site)/privacy/page.tsx`: the privacy notice (linked from the
  product footer, the BDCC footers, the consent banner, and the lead
  form). Controller identity comes from the public env vars
  NEXT_PUBLIC_ORG_NAME, NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_ORG_STREET,
  NEXT_PUBLIC_ORG_LOCALITY, NEXT_PUBLIC_ORG_POSTAL, NEXT_PUBLIC_ORG_COUNTRY
  (falls back to "the operator of this instance" and the contact page).
- `app/(site)/settings/page.tsx`, section "Your data": Export my data
  (JSON download) and Erase all my data (confirm dialog).
- `lib/privacy.ts`: pure helpers (export document, erase, server-copy
  clearing) plus PRIVACY_POLICY_UPDATED.
- `lib/analytics.ts`: consent record (choice, timestamp, policy version),
  CONSENT_POLICY_VERSION, the reopen event, and tracking-cookie expiry.
- `components/bdcc/BdccAnalytics.tsx`: the banner and tag loader, plus
  ConsentSettingsLink (the footer "cookie settings" control).
- `lib/agent-content.ts`: the markdown rendition of /privacy for agents.

## Flow(s)

1. Consent (BDCC pages only, when a tag id is configured). On first visit
   the banner shows with equal one-click accept and decline buttons and a
   link to the notice. Until a choice is made, no Google, Meta, or X
   script exists on the page and window.dataLayer is not defined. Accept
   stores {choice, at, version} in localStorage and injects the tags with
   Consent Mode set to granted. Decline stores the record and loads
   nothing. A stored record from an older CONSENT_POLICY_VERSION is
   ignored, so changing the consent text asks again.
2. Withdrawal. The "cookie settings" link in either BDCC footer reopens
   the dialog. Choosing decline after a grant expires the tags'
   first-party cookies (_ga, _gid, _gat, _gcl*, _fbp, _fbc, _twclid,
   muc_ads) on the host and each parent domain, then reloads so no
   running script survives.
3. Export (Art. 15 and 20). Settings, Your data, Export builds a JSON
   document from every tokenlens:v1:* key plus the consent record, with
   values JSON-decoded; the personal sync token is redacted because it is
   a credential. Downloaded as tokenlens-data-<date>.json.
4. Erase (Art. 17). After a confirm dialog: if a sync token is set, PUT an
   empty personal document with a fresh updatedAt to /api/personal (so
   last-write-wins cannot resurrect the old one); then remove every local
   key, the sessionStorage guard, and all Cache Storage entries. The
   status line reports a failed server clear instead of hiding it.

## Data Touched

- localStorage: tokenlens:v1:* (preferences, watchlist, positions, tiers,
  saved reports, sync token) and bdcc-ad-consent (now a JSON record; the
  bare "granted"/"denied" strings written by version 1 are treated as
  absent).
- sessionStorage: tl-chunk-reload-at. Cache Storage: the service worker
  caches.
- Server: the personal_state document, only through the existing
  token-gated PUT. No new persistent state.
- Cookies: tl_otp_session (unchanged) and, on withdrawal, expiry writes
  for the tag cookies listed above.

## Business Rules / Security

- Nothing third party loads before consent. The earlier design loaded
  gtag and GTM immediately with Consent Mode "denied"; those cookieless
  pings still send IP and user agent to Google, which EU regulators treat
  as needing consent, so the bootstrap is now gated too.
- Accept and decline have the same size, weight, and click cost (no
  "reject" buried behind a settings screen).
- Consent is recorded with timestamp and policy version (Art. 7(1)
  accountability) and withdrawal is one click from the footer (Art. 7(3)).
- The Vimeo embed carries dnt=1 so Vimeo does not track sessions; the
  notice discloses that loading the player still sends the IP to Vimeo.
- Erase clears the server copy first and reports failure; the local erase
  always proceeds. The export never includes the sync token.
- Strictly necessary storage (preferences, the OTP session cookie, the
  reload guard, the offline cache) is used without consent, as ePrivacy
  Art. 5(3) allows, and the notice says which items those are.
- Server-side, personal data handling is unchanged and minimal: IPs are
  used in memory for rate limiting only, the OTP gate only ever emails the
  operator's own configured address, and the sync store is reachable only
  with the service role key. The notice documents hosting logs as
  legitimate-interest processing.
- Copy contains no em dashes (repo rule).

## Edge Cases

- Private mode or blocked storage: consent cannot persist, the banner
  reappears next visit, and export returns an empty document.
- No tag id configured: no banner, no footer "cookie settings" control
  (there is nothing to manage), and the notice still describes the
  consented tags as conditional.
- Withdrawal on localhost: only the host-level cookie variant is written,
  which is the only one that can exist there.
- Erase while offline with a token set: local data is gone, the status
  line says the server copy was not cleared and to retry.
- Legacy consent value from before this change: treated as no choice, so
  returning visitors are asked once more under the new, stricter text.

## Non-Goals

- A consent management platform, per-vendor toggles, or granular purposes:
  one choice covers the three tag families, which the banner names.
- Server-side consent logging: there are no accounts to key it to; the
  record lives with the visitor.
- A Data Processing Agreement generator or Records of Processing
  document: operators sign their hosts' DPAs themselves. The notice lists
  the processors so that is a short list.
- Age verification: the site is not directed at children and the notice
  says so.
- A strict Content Security Policy (still deliberately omitted while the
  ad tag set evolves; see bdcc-landing.md).

## Tests

- e2e: TL-091 (no script before choice, tags after accept, versioned
  record) in e2e/bdcc.spec.ts; TL-100 to TL-102 (withdrawal via the footer
  with cookie expiry and reload, export download and erase with dialog
  accept and dismiss, notice content and links) in e2e/privacy.spec.ts.
- Unit: lib/__tests__/analytics.test.ts (record round trip, legacy and
  stale-version rejection, reopen event, cookie expiry expansion) and
  lib/__tests__/privacy.test.ts (export shape and token redaction, erase
  scope, server clear payload, failure reporting).
