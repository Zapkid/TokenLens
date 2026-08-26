import { expect, test } from "@playwright/test";

// Agent readiness surfaces: real 404s with recovery links, markdown content
// negotiation with correct Vary, machine-readable discovery files, trust
// anchor pages, and no-JS homepage content.

test.describe("Agent readiness", () => {
  test("TL-094 unknown paths return HTTP 404 with recovery links, in HTML and markdown", async ({
    request,
  }) => {
    const html = await request.get("/no-such-page-xyz");
    expect(html.status()).toBe(404);
    const body = await html.text();
    expect(body).toContain("llms.txt");
    expect(body).toContain("sitemap");

    const md = await request.get("/no-such-page-xyz", {
      headers: { Accept: "text/markdown" },
    });
    expect(md.status()).toBe(404);
    expect(md.headers()["content-type"]).toContain("text/markdown");
    expect(await md.text()).toContain("/llms.txt");
  });

  test("TL-095 discovery files: llms.txt, openapi.json, and the MCP manifest", async ({
    request,
  }) => {
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    const llmsBody = await llms.text();
    expect(llmsBody.startsWith("# TokenLens")).toBe(true);
    expect(llmsBody).toContain("## When to use TokenLens");
    expect(llmsBody).toContain("/api/mcp");

    const openapi = await request.get("/openapi.json");
    expect(openapi.status()).toBe(200);
    const spec = (await openapi.json()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };
    expect(spec.openapi).toBe("3.1.0");
    expect(Object.keys(spec.paths)).toContain("/api/search");

    const mcp = await request.get("/.well-known/mcp");
    expect(mcp.status()).toBe(200);
    const manifest = (await mcp.json()) as {
      endpoint: string;
      capabilities: { tools: Array<{ name: string }> };
    };
    expect(manifest.endpoint).toMatch(/\/api\/mcp$/);
    expect(manifest.capabilities.tools.map((t) => t.name)).toContain(
      "search_assets",
    );
  });

  test("TL-096 markdown content negotiation with Vary: Accept on both variants", async ({
    request,
  }) => {
    const expected: Record<string, string> = {
      "/": "TokenLens",
      "/bdcc": "BDCC",
    };
    for (const path of Object.keys(expected)) {
      const md = await request.get(path, {
        headers: { Accept: "text/markdown" },
      });
      expect(md.status(), `markdown for ${path}`).toBe(200);
      expect(md.headers()["content-type"]).toContain("text/markdown");
      expect(md.headers()["vary"]?.toLowerCase()).toContain("accept");
      const body = await md.text();
      expect(body.startsWith("#")).toBe(true);
      // The rendition must be page-specific, not a shared fallback.
      expect(body.split("\n")[0]).toContain(expected[path]);

      // The HTML variant still serves normally. (Next.js owns the Vary
      // header on HTML documents; the markdown responses above carry
      // Vary: Accept, and middleware rewrites run before any cache, so
      // variants cannot be mixed.)
      const html = await request.get(path, {
        headers: { Accept: "text/html" },
      });
      expect(html.status()).toBe(200);
      expect(html.headers()["content-type"]).toContain("text/html");
    }
  });

  test("TL-098 API conventions: problem+json errors, version and RateLimit headers", async ({
    request,
  }) => {
    // Invalid params produce an RFC 9457 problem with code, hint, and the
    // legacy error alias.
    const bad = await request.get("/api/report");
    expect(bad.status()).toBe(400);
    expect(bad.headers()["content-type"]).toContain("application/problem+json");
    const problem = (await bad.json()) as Record<string, unknown>;
    expect(problem.code).toBe("invalid_params");
    expect(problem.status).toBe(400);
    expect(typeof problem.detail).toBe("string");
    expect(typeof problem.hint).toBe("string");
    expect(problem.error).toBe(problem.detail);

    // Success responses carry the version and RateLimit headers.
    const ok = await request.get("/api/library");
    expect(ok.status()).toBe(200);
    const headers = ok.headers();
    expect(headers["x-api-version"]).toBe("1");
    expect(Number(headers["ratelimit-limit"])).toBeGreaterThan(0);
    expect(Number(headers["ratelimit-remaining"])).toBeGreaterThanOrEqual(0);
    expect(Number(headers["ratelimit-reset"])).toBeGreaterThan(0);
    expect(headers["ratelimit-policy"]).toContain(";w=60");
  });

  test("TL-099 unknown API paths return JSON problems, and doc aliases redirect", async ({
    request,
  }) => {
    // Both single-segment and nested unknown API paths must be JSON, never
    // an HTML error page.
    for (const path of ["/api/nope", "/api/nope/deeper"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
      expect(res.headers()["content-type"], path).toContain(
        "application/problem+json",
      );
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.code).toBe("not_found");
      expect(String(body.hint)).toContain("/openapi.json");
    }
    // The real MCP endpoint is not swallowed by the guard.
    const mcp = await request.post("/api/mcp", {
      headers: { "Content-Type": "application/json" },
      data: { jsonrpc: "2.0", id: 1, method: "ping" },
    });
    expect(mcp.status()).not.toBe(404);

    // Predictable developer-resource names.
    const docs = await request.get("/docs", { maxRedirects: 0 });
    expect([301, 308]).toContain(docs.status());
    expect(docs.headers()["location"]).toContain("/developers");
  });

  test("TL-097 trust pages carry real content and the homepage serves headings and JSON-LD without JS", async ({
    page,
    request,
  }) => {
    for (const path of ["/about", "/contact", "/privacy", "/developers"]) {
      await page.goto(path);
      const text = await page.locator("main").innerText();
      expect(text.length, `${path} content length`).toBeGreaterThan(500);
      await expect(page.locator("h1")).toHaveCount(1);
    }

    // Raw HTML checks: what a no-JavaScript crawler sees on the homepage.
    const home = await request.get("/");
    const html = await home.text();
    expect(html).toContain("<h1");
    expect((html.match(/<h2/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(html).toContain("application/ld+json");
    expect(html).toContain('"Organization"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:type"');
    expect(html).toContain('property="og:image"');
  });
});
