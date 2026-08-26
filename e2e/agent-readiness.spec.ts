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
