import { expect, test } from "@playwright/test";
import { callTool, initialize, listToolNames, rpc, toolResultJson } from "./mcp-client";

// Public MCP analysis tools, exercised as a real client would: JSON-RPC
// over the streamable HTTP transport at /api/mcp, in fixture mode.

test.describe("MCP connector", () => {
  test("TL-065 initialize handshake and tools/list expose the analysis tools", async ({
    request,
  }) => {
    const options = await initialize(request);
    const tools = await listToolNames(request, options);
    for (const name of [
      "compare_assets",
      "generate_report",
      "get_market_regime",
      "get_scenarios",
      "search_assets",
    ]) {
      expect(tools).toContain(name);
    }
  });

  test("TL-066 search_assets then generate_report round trip in fixture mode", async ({
    request,
  }) => {
    const options = await initialize(request);
    const search = await callTool(request, options, "search_assets", { query: "sol" });
    const results = toolResultJson(search.rpc?.result).results as {
      id: string;
      type: string;
    }[];
    const solana = results.find((r) => r.id === "solana" && r.type === "token");
    expect(solana).toBeDefined();

    const report = await callTool(request, options, "generate_report", {
      type: "token",
      id: "solana",
    });
    const summary = toolResultJson(report.rpc?.result);
    expect(summary.asset.id).toBe("solana");
    expect(summary.dataMode).toBe("fixture");
    expect(summary.scores.opportunity).toBeGreaterThan(0);
    expect(summary.scores.riskGrade).toMatch(/^[A-E]$/);
    expect(summary.disclaimer).toContain("not financial advice");
    // Chart series stay out of the LLM payload.
    expect(summary.priceHistory).toBeUndefined();
  });

  test("TL-067 invalid tool arguments are rejected, unknown asset returns a tool error", async ({
    request,
  }) => {
    const options = await initialize(request);
    const badType = await callTool(request, options, "generate_report", {
      type: "stock",
      id: "solana",
    });
    // Schema violation surfaces as a JSON-RPC error or an isError result.
    const rejected =
      badType.rpc?.error !== undefined ||
      (badType.rpc?.result as { isError?: boolean } | undefined)?.isError === true;
    expect(rejected).toBe(true);

    const unknown = await callTool(request, options, "generate_report", {
      type: "token",
      id: "not-a-real-asset",
    });
    const result = unknown.rpc?.result as { isError?: boolean } | undefined;
    expect(result?.isError).toBe(true);
    expect(toolResultJson(result).error).toBeTruthy();
  });

  test("TL-068 compare_assets and get_market_regime return consistent shapes", async ({
    request,
  }) => {
    const options = await initialize(request);
    const compare = await callTool(request, options, "compare_assets", {
      assets: [
        { type: "token", id: "solana" },
        { type: "token", id: "chainlink" },
      ],
    });
    const comparison = toolResultJson(compare.rpc?.result);
    expect(Object.keys(comparison.scores).sort()).toEqual(["chainlink", "solana"]);
    expect(comparison.opportunityPillars.length).toBeGreaterThan(0);

    const regime = await rpc(request, options, {
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: { name: "get_market_regime", arguments: {} },
    });
    const market = toolResultJson(regime.rpc?.result);
    expect(["risk-on", "neutral", "risk-off"]).toContain(market.regime.state);
    expect(market.regime.components.length).toBeGreaterThan(0);
  });

  test("TL-069 existing REST API routes are unaffected by the dynamic MCP route", async ({
    request,
  }) => {
    const report = await request.get("/api/report?type=token&id=solana");
    expect(report.status()).toBe(200);
    const search = await request.get("/api/search?q=sol");
    expect(search.status()).toBe(200);
  });
});
