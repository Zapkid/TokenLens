import { expect, test, type APIRequestContext } from "@playwright/test";

// MCP connector, exercised as a real client would: JSON-RPC over the
// streamable HTTP transport at /api/mcp, in fixture mode. Responses may
// arrive as plain JSON or as an SSE body depending on the transport
// negotiation, so parse both.

const MCP_URL = "/api/mcp";

interface JsonRpcResponse {
  jsonrpc: string;
  id?: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

function parseRpcBody(raw: string, contentType: string): JsonRpcResponse {
  if (contentType.includes("text/event-stream")) {
    const dataLines = raw
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    return JSON.parse(dataLines[dataLines.length - 1]);
  }
  return JSON.parse(raw);
}

async function rpc(
  request: APIRequestContext,
  sessionId: string | null,
  body: Record<string, unknown>,
): Promise<{ rpc: JsonRpcResponse | null; sessionId: string | null; status: number }> {
  const response = await request.post(MCP_URL, {
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    data: body,
  });
  const newSession = response.headers()["mcp-session-id"] ?? sessionId;
  const status = response.status();
  if (status === 202) return { rpc: null, sessionId: newSession, status };
  const parsed = parseRpcBody(
    await response.text(),
    response.headers()["content-type"] ?? "",
  );
  return { rpc: parsed, sessionId: newSession, status };
}

async function initialize(request: APIRequestContext): Promise<string | null> {
  const init = await rpc(request, null, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "tokenlens-e2e", version: "1.0.0" },
    },
  });
  expect(init.rpc?.result?.serverInfo).toMatchObject({ name: "tokenlens" });
  await rpc(request, init.sessionId, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  return init.sessionId;
}

function toolResultJson(result: Record<string, unknown> | undefined) {
  const content = result?.content as { type: string; text: string }[] | undefined;
  expect(content?.[0]?.type).toBe("text");
  return JSON.parse(content![0].text);
}

test.describe("MCP connector", () => {
  test("TL-065 initialize handshake and tools/list expose the five analysis tools", async ({
    request,
  }) => {
    const sessionId = await initialize(request);
    const list = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });
    const tools = (list.rpc?.result?.tools as { name: string }[]).map((t) => t.name);
    expect(tools.sort()).toEqual([
      "compare_assets",
      "generate_report",
      "get_market_regime",
      "get_scenarios",
      "search_assets",
    ]);
  });

  test("TL-066 search_assets then generate_report round trip in fixture mode", async ({
    request,
  }) => {
    const sessionId = await initialize(request);
    const search = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "search_assets", arguments: { query: "sol" } },
    });
    const results = toolResultJson(search.rpc?.result).results as {
      id: string;
      type: string;
    }[];
    const solana = results.find((r) => r.id === "solana" && r.type === "token");
    expect(solana).toBeDefined();

    const report = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "generate_report",
        arguments: { type: "token", id: "solana" },
      },
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
    const sessionId = await initialize(request);
    const badType = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "generate_report",
        arguments: { type: "stock", id: "solana" },
      },
    });
    // Schema violation surfaces as a JSON-RPC error or an isError result.
    const rejected =
      badType.rpc?.error !== undefined ||
      (badType.rpc?.result as { isError?: boolean } | undefined)?.isError === true;
    expect(rejected).toBe(true);

    const unknown = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "generate_report",
        arguments: { type: "token", id: "not-a-real-asset" },
      },
    });
    const result = unknown.rpc?.result as { isError?: boolean } | undefined;
    expect(result?.isError).toBe(true);
    expect(toolResultJson(result).error).toBeTruthy();
  });

  test("TL-068 compare_assets and get_market_regime return consistent shapes", async ({
    request,
  }) => {
    const sessionId = await initialize(request);
    const compare = await rpc(request, sessionId, {
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "compare_assets",
        arguments: {
          assets: [
            { type: "token", id: "solana" },
            { type: "token", id: "chainlink" },
          ],
        },
      },
    });
    const comparison = toolResultJson(compare.rpc?.result);
    expect(Object.keys(comparison.scores).sort()).toEqual(["chainlink", "solana"]);
    expect(comparison.opportunityPillars.length).toBeGreaterThan(0);

    const regime = await rpc(request, sessionId, {
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
