# Onchain analytics with email OTP gate

## Summary

/onchain browses trending DEX pools per network through the CoinGecko
onchain analytics API (the GeckoTerminal-backed endpoints under
/api/v3/onchain, see docs.coingecko.com/docs/defi-onchain-analytics).
Because these calls spend the account's CoinGecko API quota, they sit
behind an email OTP gate: a 6 digit code is emailed to the configured
owner address, and verifying it starts a 10 minute session during which
onchain requests go out without further codes.

## Entry Points

- Page: `app/(site)/onchain/page.tsx` renders `components/OnchainPanel.tsx`
  (client). Linked from the nav as "Onchain".
- API: `app/api/otp/route.ts` (GET session status; POST request/verify) and
  `app/api/onchain/route.ts` (GET trending pools, session required).
- Logic: `lib/server/otp.ts` (codes, rate limits, session tokens, Resend
  email) and `lib/onchain.ts` (CoinGecko onchain client, response mapping,
  fixture pools). Shared key/tier config: `lib/providers/coingecko.ts`.

## Flow(s)

1. The panel asks GET /api/otp. Not configured: setup card. Configured but
   no session: the gate card.
2. "Email me a code" POSTs {action:"request"}: a 6 digit code is generated
   (crypto randomInt), stored only as a secret-salted SHA-256 hash with a
   5 minute expiry, and emailed via Resend to TOKENLENS_OTP_EMAIL.
3. Verifying the code POSTs {action:"verify"}: on match the server mints a
   stateless HMAC session token "expiry.hmac" and sets it as an httpOnly,
   sameSite strict, secure cookie with a 10 minute max age.
4. GET /api/onchain?network=... verifies the cookie, then serves trending
   pools (60s in-memory cache per network) from CoinGecko with the
   server-side API key. The panel renders the table with a CoinGecko
   attribution link and lets the user switch networks within the session.

## Data Touched

- No persistent storage. OTP state (code hashes, rate-limit windows) is
  in-memory per server instance; sessions are stateless HMAC tokens so they
  survive instance recycling for their lifetime.

## Business Rules / Security

- Env (server side only, never NEXT_PUBLIC): COINGECKO_API_KEY,
  COINGECKO_API_TIER (demo or pro; picks the host and auth header),
  TOKENLENS_OTP_EMAIL, TOKENLENS_OTP_SECRET (long random, hashes codes and
  signs sessions), RESEND_API_KEY (email transport).
- The gate is env-gated: without email plus a 16+ char secret, /api/onchain
  and /api/otp answer 503 and the page shows the setup card.
- Codes: 6 digits, single use, 5 minute TTL, never logged or stored in
  clear. Requests are rate limited (3 per 10 minutes in production) and
  verification locks after 8 failed attempts per window.
- Session cookie is httpOnly (JS cannot read it), sameSite strict, secure
  in production, 10 minute max age matching the token expiry.
- The CoinGecko key never reaches the client; the panel only talks to the
  two internal routes.
- Fixture mode (TOKENLENS_DATA_MODE=fixture): no email is sent, the request
  response includes the code (devCode) for tests, a fixed secret keeps the
  session flow working, and pools are deterministic fixtures. Fixture mode
  must never be enabled in production.

## Edge Cases

- A second server instance does not share OTP state: the code request is
  simply repeated there; sessions verify anywhere (stateless HMAC).
- Missing COINGECKO_API_KEY with a valid session: 503 with a setup hint.
- Unknown network ids: 400. CoinGecko failures: 502 without leaking the
  upstream URL or key.
- Session expiry mid-use: the next request 401s and the panel drops back to
  the gate.

## Non-Goals

- No user accounts or multi-user auth: one owner address, one gate.
- No persistence of onchain data beyond the 60s cache.
- No pool drill-down, OHLCV, or trades endpoints yet; trending pools only.
