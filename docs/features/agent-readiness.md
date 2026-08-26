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
