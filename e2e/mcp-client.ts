// Minimal MCP-over-streamable-HTTP client helpers shared by the MCP e2e
// specs. Speaks JSON-RPC exactly as a real client would; responses may be
// plain JSON or SSE bodies depending on transport negotiation.

import { expect, type APIRequestContext } from "@playwright/test";

export const MCP_URL = "/api/mcp";

export interface JsonRpcResponse {
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

export interface RpcOptions {
  sessionId?: string | null;
  bearerToken?: string;
}

export async function rpc(
  request: APIRequestContext,
  options: RpcOptions,
  body: Record<string, unknown>,
): Promise<{ rpc: JsonRpcResponse | null; sessionId: string | null; status: number }> {
  const response = await request.post(MCP_URL, {
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(options.sessionId ? { "mcp-session-id": options.sessionId } : {}),
      ...(options.bearerToken
        ? { authorization: `Bearer ${options.bearerToken}` }
        : {}),
    },
    data: body,
  });
  const sessionId = response.headers()["mcp-session-id"] ?? options.sessionId ?? null;
  const status = response.status();
  if (status === 202) return { rpc: null, sessionId, status };
  const parsed = parseRpcBody(
    await response.text(),
    response.headers()["content-type"] ?? "",
  );
  return { rpc: parsed, sessionId, status };
}

export async function initialize(
  request: APIRequestContext,
  bearerToken?: string,
): Promise<RpcOptions> {
  const init = await rpc(request, { bearerToken }, {
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
  const options = { sessionId: init.sessionId, bearerToken };
  await rpc(request, options, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  return options;
}

let nextId = 100;

export async function callTool(
  request: APIRequestContext,
  options: RpcOptions,
  name: string,
  args: Record<string, unknown>,
): Promise<{ rpc: JsonRpcResponse | null }> {
  return rpc(request, options, {
    jsonrpc: "2.0",
    id: nextId++,
    method: "tools/call",
    params: { name, arguments: args },
  });
}

export function toolResultJson(result: Record<string, unknown> | undefined) {
  const content = result?.content as { type: string; text: string }[] | undefined;
  expect(content?.[0]?.type).toBe("text");
  return JSON.parse(content![0].text);
}

export async function listToolNames(
  request: APIRequestContext,
  options: RpcOptions,
): Promise<string[]> {
  const list = await rpc(request, options, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  return (list.rpc?.result?.tools as { name: string }[]).map((t) => t.name);
}
