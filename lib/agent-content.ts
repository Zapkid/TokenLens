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
        "TokenLens has no user accounts. Preferences, watchlists, and portfolio entries stay in your browser localStorage unless you configure the optional personal sync token. Analytics and advertising tags load only after explicit consent. Full policy:",
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

/** Minimal but accurate OpenAPI 3.1 description of the public REST API. */
export function openApiSpec(base: string) {
  const report = { $ref: "#/components/schemas/AnyJson" };
  return {
    openapi: "3.1.0",
    info: {
      title: "TokenLens API",
      version: "1.0.0",
      description:
        "Public read-only endpoints behind the TokenLens crypto analysis app. No authentication. An MCP server with the same capabilities runs at /api/mcp (Streamable HTTP).",
      contact: { url: "https://github.com/Zapkid/TokenLens/issues" },
    },
    servers: [{ url: base }],
    paths: {
      "/api/search": {
        get: {
          summary: "Resolve a free-text query to TokenLens asset ids",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
          ],
          responses: { "200": { description: "Ranked matches", content: { "application/json": { schema: report } } } },
        },
      },
      "/api/report": {
        get: {
          summary: "Full analysis report for one asset",
          parameters: [
            { name: "type", in: "query", required: true, schema: { type: "string", enum: ["token", "chain"] } },
            { name: "id", in: "query", required: true, schema: { type: "string" } },
            { name: "refresh", in: "query", required: false, schema: { type: "string", enum: ["1"] } },
          ],
          responses: {
            "200": { description: "Report", content: { "application/json": { schema: report } } },
            "400": { description: "Missing or invalid type/id" },
          },
        },
      },
      "/api/library": {
        get: {
          summary: "Top tokens by market cap and chains by TVL",
          responses: { "200": { description: "Library lists", content: { "application/json": { schema: report } } } },
        },
      },
      "/api/market": {
        get: {
          summary: "Global market regime snapshot",
          responses: { "200": { description: "Regime", content: { "application/json": { schema: report } } } },
        },
      },
      "/api/prices": {
        get: {
          summary: "Quotes for known asset ids",
          parameters: [
            { name: "ids", in: "query", required: true, schema: { type: "string", description: "Comma-separated TokenLens asset ids" } },
          ],
          responses: { "200": { description: "Quotes", content: { "application/json": { schema: report } } } },
        },
      },
    },
    components: { schemas: { AnyJson: { description: "Response shapes are documented in the repository docs", type: "object", additionalProperties: true } } },
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

/** Homepage identity graph: WebSite + SoftwareApplication + Organization.
 * Contact email is optional and injected via NEXT_PUBLIC_CONTACT_EMAIL. */
export function tokenLensJsonLd(base: string, contactEmail?: string) {
  const contactPoint: Record<string, string> = {
    "@type": "ContactPoint",
    contactType: "technical support",
    url: "https://github.com/Zapkid/TokenLens/issues",
  };
  if (contactEmail) contactPoint.email = contactEmail;
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
      },
    ],
  };
}
