# Agent readiness

## Summary

Machine-readable surfaces and conventions that let AI agents discover,
understand, and call TokenLens: llms.txt with when-to-use guidance,
markdown content negotiation, a real 404 with recovery links, an OpenAPI
description of the public REST API, an MCP handshake manifest, homepage
JSON-LD identity, and human trust anchor pages (about, contact, privacy,
developers).

## Entry Points

- `lib/agent-content.ts`: pure builders for every surface (llms.txt,
  per-path markdown, 404 markdown, OpenAPI spec, MCP manifest, JSON-LD).
- Routes: `app/llms.txt/route.ts`, `app/openapi.json/route.ts`,
  `app/.well-known/mcp/route.ts`, `app/api/markdown/route.ts`.
- `middleware.ts`: markdown negotiation and Vary headers.
- `app/not-found.tsx`: the recovery 404 page.
- Trust pages in the app shell: `app/(site)/about`, `contact`, `privacy`,
  `developers`, linked from the site footer.
- Homepage additions in `app/(site)/page.tsx`: canonical, JSON-LD graph,
  and a server-rendered summary section with h2 headings.

## Flow(s)

1. Markdown negotiation (acceptmarkdown.com): middleware rewrites any GET
   or HEAD page request whose Accept header lists text/markdown to
   /api/markdown, which serves a markdown rendition of known pages (200)
   or a markdown 404 with recovery links. Markdown responses carry
   Vary: Accept. Next.js owns the Vary header on HTML documents and
   overwrites additions there (framework limitation); mixing is still
   impossible because the middleware decision runs before any cache on
   every request. The original path travels to the markdown route as an
   x-markdown-path request header because rewrite handling can strip
   query params.
2. 404s: unmatched paths render app/not-found.tsx with a real HTTP 404
   status and links to the sitemap, llms.txt, and the developer guide.
3. Discovery: /llms.txt (llmstxt.org format with a "When to use
   TokenLens" section), /openapi.json (OpenAPI 3.1 for the five public
   REST endpoints), /.well-known/mcp (endpoint, transport, and tool list
   for the MCP server at /api/mcp), plus sitemap and robots.
4. Identity: the homepage embeds a JSON-LD graph (WebSite,
   SoftwareApplication, Organization with a GitHub contactPoint and
   optional NEXT_PUBLIC_CONTACT_EMAIL) and full metadata (canonical,
   og:type, og:site_name, og:image, twitter card).

## API conventions

- Version: 1, echoed as X-API-Version on every public API response.
  Breaking changes ship only as new /api/v2 paths; old paths then emit
  Deprecation and Sunset headers (RFC 8594) at least 90 days before
  removal, announced on /developers and in this repository. Additive
  optional fields do not bump the version.
- Rate limits: fixed window of 60 requests per client per 60 seconds
  (env-tunable via TOKENLENS_RATE_LIMIT; relaxed in fixture mode so e2e
  never trips it). Responses carry RateLimit-Limit, RateLimit-Remaining,
  RateLimit-Reset, and RateLimit-Policy; 429 adds Retry-After. The
  limiter is in-memory per instance, so it is best effort on serverless.
- Errors: RFC 9457 application/problem+json with extension members
  `code` (stable, machine readable), `hint` (how to recover), and
  `error` (legacy alias of detail for existing clients). Codes:

### invalid_params

Missing or malformed query parameters. Fix the request; the hint names
the expected parameters and where ids come from (/api/search).

### rate_limited

The 60 requests per minute window is exhausted. Wait Retry-After
seconds; self-throttle using the RateLimit headers.

### upstream_unavailable

An upstream market data provider (CoinGecko, DeFiLlama, alternative.me)
failed or throttled us. Retry after a short delay.

### report_failed

Report generation failed: the id is unknown (TokenLens rejects unknown
assets rather than fabricating data) or upstream data was unavailable.
Resolve the id with /api/search and retry.

### not_found

No API endpoint at that path (unknown paths never return HTML). The
hint lists the public endpoints; /openapi.json is the full description.

### not_configured, verification_required, invalid_code, email_failed, otp_request_failed

Owner-gated surfaces (/api/otp, /api/onchain): the deployment lacks the
required server env, or the email OTP session is missing, wrong, or
could not be issued. Follow the hint in the response; these surfaces
are not publicly usable by design.

Developer-resource aliases: /docs and /api-docs redirect permanently to
/developers, and /openapi.yaml to /openapi.json.

## Data Touched

- None. Every surface is computed from static content and lib/site.ts.

## Business Rules / Security

- The markdown route only ever serves content from the static page map;
  the path parameter selects a builder and is never echoed into markup
  beyond a code span in the 404 body.
- The MCP manifest documents that personal tools require the owner bearer
  token; it grants nothing by itself.
- Organization JSON-LD includes a contact email only when
  NEXT_PUBLIC_CONTACT_EMAIL is set (a public identifier by definition);
  no postal address is published until a real one exists.
- Copy contains no em dashes, per the repo rule.

## Edge Cases

- Middleware skips /api, Next internals, and machine files, so JSON and
  API responses are never rewritten and the markdown route cannot loop.
- Browsers never send Accept: text/markdown, so human traffic is
  unaffected; the service worker fetches HTML as before.
- Unknown markdown paths return 404 (never a soft 200), matching the
  HTML behavior.

## Non-Goals

- No auto-generated markdown from rendered HTML: renditions are curated
  per page and kept short.
- No search-engine indexing work (Search Console, press links): that
  requires actions outside the repository.
