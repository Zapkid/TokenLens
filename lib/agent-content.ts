// Machine-readable surfaces for AI agents: llms.txt, markdown content
// negotiation (acceptmarkdown.com), a minimal OpenAPI description of the
// public REST API, the /.well-known/mcp manifest, and homepage JSON-LD.
// Everything is pure and takes the site origin as input so it is
// unit-testable and consistent across routes.

import { BDCC_CONTENT, BDCC_SITE_URL, bdccUrl } from "@/lib/bdcc";

export const TOKENLENS_SUMMARY =
  "TokenLens is an on-demand crypto token and blockchain analysis tool. " +
  "Type a token or chain and get a full report: opportunity and risk " +
  "scores, scenario trajectories, market regime context, and a " +
  "disciplined holding strategy, built from public market data.";

export const MCP_PUBLIC_TOOLS = [
  { name: "search_assets", description: "Resolve a free-text query to TokenLens asset ids (tokens and chains)." },
  { name: "generate_report", description: "Full analysis report for one asset: scores, pillars, risk grade, strategy." },
  { name: "get_scenarios", description: "Bear, base, and bull trajectory scenarios for an asset across three horizons." },
  { name: "compare_assets", description: "Score matrix and pillar comparison for 2 to 4 assets." },
  { name: "get_market_regime", description: "Global risk-on, neutral, or risk-off market regime with components." },
] as const;

export const MCP_PERSONAL_TOOLS = [
  "get_watchlist",
  "add_to_watchlist",
  "remove_from_watchlist",
  "get_portfolio",
  "add_position",
  "remove_position",
] as const;

/** llms.txt per the llmstxt.org format: H1, blockquote summary, detail
 * paragraph, then H2 link sections. Includes explicit when-to-use guidance
 * for agents. */
export function llmsTxt(base: string): string {
  return `# TokenLens

> ${TOKENLENS_SUMMARY}

TokenLens is a personal-use decision support tool, not financial advice. It runs at ${base}, is open source, and exposes both a REST API and an MCP (Model Context Protocol) server so agents can use it programmatically. Market data comes from CoinGecko, TVL from DeFiLlama, and sentiment from alternative.me.

## When to use TokenLens

- Use it when you need a structured analysis of a specific crypto token or blockchain: opportunity and risk scores, a risk grade, and bear/base/bull scenarios.
- Use it to compare 2 to 4 crypto assets on the same scoring rubric, or to check the current global market regime (risk-on, neutral, risk-off).
- Call the MCP server at ${base}/api/mcp (Streamable HTTP) with the tools search_assets, generate_report, get_scenarios, compare_assets, and get_market_regime. Resolve ids with search_assets first.
- Prefer the REST API (${base}/openapi.json) for one-off HTTP calls: /api/search?q=..., /api/report?type=token|chain&id=..., /api/library, /api/market, /api/prices?ids=...
- API conventions: version 1 (X-API-Version header; breaking changes only as /api/v2 with Deprecation and Sunset headers and 90 days notice), 60 requests per minute with RateLimit-* headers and Retry-After on 429, and all errors as RFC 9457 application/problem+json with a machine-readable code and a recovery hint.
- Do not use it for live trading execution, order routing, or as a source of personalized financial advice.

## Docs

- [Developer guide](${base}/developers): REST endpoints, MCP connector setup, and rate expectations
- [Methodology](${base}/methodology): how scores, grades, and scenarios are computed
- [About](${base}/about): what TokenLens is and who runs it
- [Source code](https://github.com/Zapkid/TokenLens): full implementation and feature docs

## API

- [OpenAPI description](${base}/openapi.json): public REST endpoints
- [MCP manifest](${base}/.well-known/mcp): Model Context Protocol server handshake
- [Sitemap](${base}/sitemap.xml): all indexable pages

## Optional

- [BDCC landing page](${base}/bdcc): Hebrew demo landing page for the Blockchain and Digital Currency College
- [Privacy](${base}/privacy) and [Contact](${base}/contact)
`;
}

function mdPage(title: string, lines: string[]): string {
  return `# ${title}\n\n${lines.join("\n\n")}\n`;
}

/** Markdown rendition of a page for Accept: text/markdown negotiation.
 * Returns found=false (with a recovery body) for unknown paths. */
export function markdownForPath(
  path: string,
  base: string,
): { found: boolean; markdown: string } {
  const normalized = path.replace(/\/+$/, "") || "/";
  const pages: Record<string, () => string> = {
    "/": () =>
      mdPage("TokenLens", [
        TOKENLENS_SUMMARY,
        "Type a token or a blockchain and get a full report: scores, risk grade, scenario trajectories, and a disciplined holding strategy.",
        `- [Developer guide](${base}/developers)\n- [Methodology](${base}/methodology)\n- [OpenAPI](${base}/openapi.json)\n- [MCP manifest](${base}/.well-known/mcp)\n- [llms.txt](${base}/llms.txt)`,
      ]),
    "/developers": () =>
      mdPage("TokenLens developer guide", [
        "Public REST endpoints (no auth):",
        `- \`GET /api/search?q=<query>\`: resolve tokens and chains to ids\n- \`GET /api/report?type=token|chain&id=<id>\`: full analysis report\n- \`GET /api/library\`: top tokens and chains\n- \`GET /api/market\`: market regime snapshot\n- \`GET /api/prices?ids=<id,id>\`: quotes for known ids`,
        `MCP server: Streamable HTTP at \`${base}/api/mcp\` with tools ${MCP_PUBLIC_TOOLS.map((t) => t.name).join(", ")}. Manifest: ${base}/.well-known/mcp`,
        `Machine-readable API description: ${base}/openapi.json`,
      ]),
    "/about": () =>
      mdPage("About TokenLens", [
        TOKENLENS_SUMMARY,
        "TokenLens is a personal, open source project. It is decision support for personal use and is not financial advice.",
        `Source: https://github.com/Zapkid/TokenLens`,
      ]),
    "/contact": () =>
      mdPage("Contact TokenLens", [
        "The fastest way to reach the maintainer is a GitHub issue: https://github.com/Zapkid/TokenLens/issues",
        `More: ${base}/about, ${base}/privacy`,
      ]),
    "/privacy": () =>
      mdPage("TokenLens privacy", [
        "TokenLens has no user accounts. Preferences, watchlists, and portfolio entries stay in your browser localStorage unless you configure the optional personal sync token. No analytics or advertising script loads until explicit consent, which can be withdrawn at any time. Under the GDPR you can export or erase everything from Settings, Your data; the notice names the controller, legal bases, retention, third parties, and how to complain to a supervisory authority. Full notice:",
        `${base}/privacy`,
      ]),
    "/methodology": () =>
      mdPage("TokenLens methodology", [
        "Scores combine opportunity and risk pillars computed from public market data with cohort percentiles; scenarios come from a volatility cone with visible modifiers. Full write-up:",
        `${base}/methodology`,
      ]),
    "/onchain": () =>
      mdPage("TokenLens onchain analytics", [
        "Trending DEX pools per network from the CoinGecko onchain API. This surface is gated by an owner email verification code and is not publicly callable.",
      ]),
    "/bdcc": () => bdccMarkdown(base, "/bdcc"),
    "/bdcc2": () => bdccMarkdown(base, "/bdcc2"),
  };
  const build = pages[normalized];
  if (build) return { found: true, markdown: build() };
  return { found: false, markdown: notFoundMarkdown(base, normalized) };
}

function bdccMarkdown(base: string, path: string): string {
  const c = BDCC_CONTENT;
  return mdPage(`BDCC: ${c.nameHe}`, [
    c.heroSubtitle,
    `${c.about}`,
    `Courses:\n${c.courses
      .map((course) => `- [${course.title}](${bdccUrl(course.path)}): ${course.tagline}`)
      .join("\n")}`,
    `Contact: ${c.contact.email}, ${c.contact.phoneDisplay}, ${c.contact.city}. Official site: ${BDCC_SITE_URL}`,
    `This is a demo landing page at ${base}${path}; content and rights belong to BDCC.`,
  ]);
}

/** Recovery body for 404 responses: where an agent should look next. */
export function notFoundMarkdown(base: string, path?: string): string {
  return mdPage("404: page not found on TokenLens", [
    path ? `There is no page at \`${path}\`.` : "There is no page at this path.",
    `Places to look next:\n- [Home](${base}/)\n- [Sitemap](${base}/sitemap.xml)\n- [llms.txt](${base}/llms.txt): what this site is and when to use it\n- [Developer guide](${base}/developers)\n- [OpenAPI](${base}/openapi.json)\n- [MCP manifest](${base}/.well-known/mcp)`,
  ]);
}

const VERSIONING_POLICY =
  "Versioning: the current API version is 1, echoed on every response as the X-API-Version header. " +
  "Breaking changes ship only as new /api/v2 paths; the old paths then emit Deprecation and Sunset headers (RFC 8594) at least 90 days before removal, with the timeline documented at /developers and in the repository changelog. " +
  "Additive changes (new optional fields) do not bump the version. " +
  `Rate limits: 60 requests per client per 60 seconds. Every response carries RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, and RateLimit-Policy headers; an exhausted window returns 429 with Retry-After. ` +
  "Errors: all 4xx and 5xx responses are RFC 9457 application/problem+json with a stable machine-readable `code`, a human-readable `detail`, and a `hint` describing how to recover.";

function problemRef(description: string) {
  return {
    description,
    content: {
      "application/problem+json": {
        schema: { $ref: "#/components/schemas/Problem" },
      },
    },
  };
}

function jsonResponse(description: string, schemaRef: string) {
  return {
    description,
    content: { "application/json": { schema: { $ref: schemaRef } } },
  };
}

/** OpenAPI 3.1 description of the public REST API, with unique operation
 * ids, typed schemas, RFC 9457 error responses, and the versioning and
 * rate limit policy in the description. */
export function openApiSpec(base: string) {
  const rateLimited = problemRef(
    "Rate limit exceeded; wait Retry-After seconds",
  );
  const upstreamFailed = problemRef("Upstream data provider failed");
  return {
    openapi: "3.1.0",
    info: {
      title: "TokenLens API",
      version: "1.0.0",
      description: `Public read-only endpoints behind the TokenLens crypto analysis app. No authentication. An MCP server with the same capabilities runs at ${base}/api/mcp (Streamable HTTP). ${VERSIONING_POLICY}`,
      contact: { url: "https://github.com/Zapkid/TokenLens/issues" },
    },
    servers: [{ url: base }],
    paths: {
      "/api/search": {
        get: {
          operationId: "searchAssets",
          summary: "Resolve a free-text query to TokenLens asset ids",
          description:
            "Ranked token and chain matches for a name, symbol, or slug. Call this first: every other endpoint takes the ids it returns.",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              description: "Free-text query, e.g. 'solana' or 'uni'",
              schema: { type: "string", minLength: 1 },
            },
          ],
          responses: {
            "200": jsonResponse("Ranked matches", "#/components/schemas/SearchResponse"),
            "429": rateLimited,
            "502": upstreamFailed,
          },
        },
      },
      "/api/report": {
        get: {
          operationId: "generateReport",
          summary: "Full analysis report for one asset",
          description:
            "Opportunity and risk scores, pillar breakdowns, risk grade, scenario trajectories, and holding strategy for one token or chain. Unknown ids are rejected, never fabricated.",
          parameters: [
            {
              name: "type",
              in: "query",
              required: true,
              description: "Asset kind: 'token' for coins, 'chain' for blockchains",
              schema: { type: "string", enum: ["token", "chain"] },
            },
            {
              name: "id",
              in: "query",
              required: true,
              description: "TokenLens asset id from /api/search",
              schema: { type: "string" },
            },
            {
              name: "refresh",
              in: "query",
              required: false,
              description: "Set to 1 to bypass the report cache",
              schema: { type: "string", enum: ["1"] },
            },
          ],
          responses: {
            "200": jsonResponse("The report", "#/components/schemas/ReportResponse"),
            "400": problemRef("Missing or invalid type/id (code: invalid_params)"),
            "429": rateLimited,
            "502": problemRef("Report generation failed (code: report_failed)"),
          },
        },
      },
      "/api/library": {
        get: {
          operationId: "getLibrary",
          summary: "Top tokens by market cap and chains by TVL",
          description: "Ten top tokens (stablecoins excluded) and ten top chains, recomputed on a cache interval.",
          responses: {
            "200": jsonResponse("Library lists", "#/components/schemas/LibraryResponse"),
            "429": rateLimited,
            "502": upstreamFailed,
          },
        },
      },
      "/api/market": {
        get: {
          operationId: "getMarketRegime",
          summary: "Global market regime snapshot",
          description: "Risk-on, neutral, or risk-off composite with its components plus trending assets.",
          responses: {
            "200": jsonResponse("Regime and trending", "#/components/schemas/MarketResponse"),
            "429": rateLimited,
            "502": upstreamFailed,
          },
        },
      },
      "/api/prices": {
        get: {
          operationId: "getPrices",
          summary: "Quotes for known asset ids",
          description: "Current price and 24h change for up to 100 known ids.",
          parameters: [
            {
              name: "ids",
              in: "query",
              required: true,
              description: "Comma-separated TokenLens asset ids from /api/search",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("Quotes", "#/components/schemas/PricesResponse"),
            "400": problemRef("Missing ids (code: invalid_params)"),
            "429": rateLimited,
            "502": upstreamFailed,
          },
        },
      },
    },
    components: {
      schemas: {
        Problem: {
          type: "object",
          description:
            "RFC 9457 problem details. code is stable and machine-readable; hint says how to recover; error mirrors detail for legacy clients.",
          required: ["type", "title", "status", "code", "detail"],
          properties: {
            type: { type: "string", format: "uri" },
            title: { type: "string" },
            status: { type: "integer" },
            code: {
              type: "string",
              enum: ["invalid_params", "rate_limited", "upstream_unavailable", "report_failed"],
            },
            detail: { type: "string" },
            hint: { type: "string" },
            instance: { type: "string" },
            error: { type: "string", description: "Legacy alias of detail" },
          },
        },
        Asset: {
          type: "object",
          required: ["id", "type", "name"],
          properties: {
            id: { type: "string", description: "TokenLens asset id" },
            type: { type: "string", enum: ["token", "chain"] },
            name: { type: "string" },
            symbol: { type: "string" },
          },
          additionalProperties: true,
        },
        SearchResponse: {
          type: "object",
          required: ["results"],
          properties: {
            results: { type: "array", items: { $ref: "#/components/schemas/Asset" } },
          },
        },
        ReportResponse: {
          type: "object",
          required: ["report"],
          properties: {
            report: {
              type: "object",
              description:
                "Full report: asset identity, pillar scores, overall opportunity/risk/grade, scenarios, events, strategy. Field-level documentation lives in the repository docs.",
              additionalProperties: true,
            },
          },
        },
        LibraryResponse: {
          type: "object",
          required: ["library"],
          properties: {
            library: {
              type: "object",
              properties: {
                tokens: { type: "array", items: { $ref: "#/components/schemas/Asset" } },
                chains: { type: "array", items: { $ref: "#/components/schemas/Asset" } },
                asOf: { type: "string", format: "date-time" },
                dataMode: { type: "string" },
              },
              additionalProperties: true,
            },
          },
        },
        MarketResponse: {
          type: "object",
          required: ["regime"],
          properties: {
            regime: {
              type: "object",
              properties: {
                state: { type: "string", enum: ["risk-on", "neutral", "risk-off"] },
                score: { type: "number" },
              },
              additionalProperties: true,
            },
            trending: { type: "array", items: { type: "object", additionalProperties: true } },
          },
        },
        PricesResponse: {
          type: "object",
          required: ["quotes"],
          properties: {
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  priceUsd: { type: ["number", "null"] },
                },
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
  };
}

/** Handshake manifest served at /.well-known/mcp. */
export function mcpManifest(base: string) {
  return {
    name: "TokenLens",
    description:
      "Crypto token and blockchain analysis over MCP: search assets, generate scored reports, scenario trajectories, comparisons, and the global market regime.",
    endpoint: `${base}/api/mcp`,
    transport: ["streamable-http"],
    authentication: {
      type: "none",
      note: "Analysis tools are public. Six additional personal tools (watchlist and portfolio) require a bearer token configured by the site owner.",
    },
    capabilities: {
      tools: [
        ...MCP_PUBLIC_TOOLS.map((t) => ({ name: t.name, description: t.description })),
        ...MCP_PERSONAL_TOOLS.map((name) => ({ name, description: "Personal tool, bearer token required" })),
      ],
    },
    documentation: `${base}/developers`,
    openapi: `${base}/openapi.json`,
    llms: `${base}/llms.txt`,
  };
}

export interface OrgContact {
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

/** Homepage identity graph: WebSite + SoftwareApplication + Organization.
 * Contact email, phone, and postal address are optional and injected via
 * NEXT_PUBLIC_CONTACT_* and NEXT_PUBLIC_ORG_* env vars; nothing is
 * fabricated when they are unset. */
export function tokenLensJsonLd(base: string, contact: OrgContact = {}) {
  const contactPoint: Record<string, string> = {
    "@type": "ContactPoint",
    contactType: "technical support",
    url: "https://github.com/Zapkid/TokenLens/issues",
  };
  if (contact.email) contactPoint.email = contact.email;
  if (contact.phone) contactPoint.telephone = contact.phone;
  const address =
    contact.address && Object.values(contact.address).some(Boolean)
      ? {
          "@type": "PostalAddress",
          ...Object.fromEntries(
            Object.entries(contact.address).filter(([, v]) => Boolean(v)),
          ),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "TokenLens",
        description: TOKENLENS_SUMMARY,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        name: "TokenLens",
        url: base,
        description: TOKENLENS_SUMMARY,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "TokenLens",
        url: base,
        logo: `${base}/icons/icon-512.png`,
        sameAs: ["https://github.com/Zapkid/TokenLens"],
        contactPoint: [contactPoint],
        ...(address ? { address } : {}),
      },
    ],
  };
}
