import { describe, expect, it } from "vitest";
import {
  MCP_PUBLIC_TOOLS,
  llmsTxt,
  markdownForPath,
  mcpManifest,
  notFoundMarkdown,
  openApiSpec,
  tokenLensJsonLd,
} from "../agent-content";

const BASE = "https://example.com";

describe("llmsTxt", () => {
  const txt = llmsTxt(BASE);

  it("follows the llms.txt shape: H1, blockquote summary, H2 sections", () => {
    const lines = txt.split("\n");
    expect(lines[0]).toBe("# TokenLens");
    expect(lines[2].startsWith("> ")).toBe(true);
    expect(txt).toContain("## When to use TokenLens");
    expect(txt).toContain("## Docs");
    expect(txt).toContain("## API");
  });

  it("names concrete agent entry points with absolute links", () => {
    expect(txt).toContain(`${BASE}/api/mcp`);
    expect(txt).toContain(`${BASE}/openapi.json`);
    expect(txt).toContain(`${BASE}/developers`);
    expect(txt).toContain("search_assets");
    expect(txt).toContain("Do not use it for");
  });
});

describe("markdownForPath", () => {
  it("renders known pages with a title and useful links", () => {
    const home = markdownForPath("/", BASE);
    expect(home.found).toBe(true);
    expect(home.markdown).toContain("# TokenLens");
    expect(home.markdown).toContain(`${BASE}/developers`);

    const bdcc = markdownForPath("/bdcc", BASE);
    expect(bdcc.found).toBe(true);
    expect(bdcc.markdown).toContain("BDCC");
    expect(bdcc.markdown).toContain(
      "https://www.bdcc.co.il/blockchain-expert-course",
    );
  });

  it("normalizes trailing slashes", () => {
    expect(markdownForPath("/developers/", BASE).found).toBe(true);
  });

  it("returns a recovery 404 body for unknown paths", () => {
    const missing = markdownForPath("/no-such-page", BASE);
    expect(missing.found).toBe(false);
    expect(missing.markdown).toContain("404");
    expect(missing.markdown).toContain(`${BASE}/llms.txt`);
    expect(missing.markdown).toContain(`${BASE}/sitemap.xml`);
    expect(notFoundMarkdown(BASE)).toContain("sitemap.xml");
  });
});

describe("openApiSpec", () => {
  const spec = openApiSpec(BASE);

  it("is OpenAPI 3.1 with the five public endpoints and server url", () => {
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.servers[0].url).toBe(BASE);
    for (const path of [
      "/api/search",
      "/api/report",
      "/api/library",
      "/api/market",
      "/api/prices",
    ]) {
      expect(Object.keys(spec.paths)).toContain(path);
    }
  });

  it("documents required query params accurately", () => {
    const report = spec.paths["/api/report"].get;
    const names = report.parameters?.map((p) => p.name);
    expect(names).toEqual(["type", "id", "refresh"]);
    expect(report.parameters?.[0].schema).toMatchObject({
      enum: ["token", "chain"],
    });
  });

  it("gives every operation a unique operationId and a description", () => {
    const ops = Object.values(spec.paths).map((p) => p.get);
    const ids = ops.map((op) => op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("searchAssets");
    for (const op of ops) {
      expect(op.description?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it("documents errors as RFC 9457 problem+json with a typed schema", () => {
    const problem = spec.components.schemas.Problem;
    expect(problem.required).toContain("code");
    expect(problem.properties.code.enum).toContain("rate_limited");
    const report = spec.paths["/api/report"].get;
    const badRequest = report.responses["400"] as {
      content: Record<string, unknown>;
    };
    expect(Object.keys(badRequest.content)).toContain(
      "application/problem+json",
    );
    expect(report.responses["429"]).toBeDefined();
  });

  it("declares the versioning and rate limit policy in the description", () => {
    expect(spec.info.description).toContain("X-API-Version");
    expect(spec.info.description).toContain("Sunset");
    expect(spec.info.description).toContain("60 requests");
    expect(spec.info.description).toContain("problem+json");
  });
});

describe("mcpManifest", () => {
  const manifest = mcpManifest(BASE);

  it("points at the streamable HTTP endpoint and lists every tool", () => {
    expect(manifest.endpoint).toBe(`${BASE}/api/mcp`);
    expect(manifest.transport).toContain("streamable-http");
    const names = manifest.capabilities.tools.map((t) => t.name);
    for (const t of MCP_PUBLIC_TOOLS) expect(names).toContain(t.name);
    expect(names).toContain("get_portfolio");
    expect(manifest.documentation).toBe(`${BASE}/developers`);
  });
});

describe("tokenLensJsonLd", () => {
  it("emits WebSite, SoftwareApplication, and Organization with contact", () => {
    const graph = tokenLensJsonLd(BASE, { email: "owner@example.com" })[
      "@graph"
    ];
    const types = graph.map((n) => n["@type"]);
    expect(types).toEqual(["WebSite", "SoftwareApplication", "Organization"]);
    const org = graph[2] as {
      contactPoint: Array<Record<string, string>>;
      sameAs: string[];
    };
    expect(org.contactPoint[0].email).toBe("owner@example.com");
    expect(org.contactPoint[0].contactType).toBe("technical support");
    expect(org.sameAs[0]).toContain("github.com");
  });

  it("includes phone and a PostalAddress when configured, never fabricated", () => {
    const withAddress = tokenLensJsonLd(BASE, {
      email: "owner@example.com",
      phone: "+972000000000",
      address: { addressLocality: "Tel Aviv", addressCountry: "IL" },
    })["@graph"][2] as Record<string, unknown>;
    expect(
      (withAddress.contactPoint as Array<Record<string, string>>)[0].telephone,
    ).toBe("+972000000000");
    expect(withAddress.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Tel Aviv",
      addressCountry: "IL",
    });

    const bare = tokenLensJsonLd(BASE)["@graph"][2] as Record<string, unknown>;
    expect(bare.address).toBeUndefined();
  });

  it("omits email cleanly when not configured", () => {
    const graph = tokenLensJsonLd(BASE)["@graph"];
    const org = graph[2] as { contactPoint: Array<Record<string, string>> };
    expect(org.contactPoint[0].email).toBeUndefined();
    expect(org.contactPoint[0].url).toContain("issues");
  });
});
