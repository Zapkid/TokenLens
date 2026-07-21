import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";
import { callTool, initialize, listToolNames, toolResultJson } from "./mcp-client";

// Personal state over MCP and the web sync loop. The e2e server runs with
// TOKENLENS_PERSONAL_TOKEN set (playwright.config.ts) and the fixture
// data mode, whose personal store is in-memory in the single server
// process, so specs that touch shared personal state run serially.

const TOKEN = "e2e-personal-token";
const t = (id: string) => `[data-testid="${id}"]`;

test.describe.configure({ mode: "serial" });

test.describe("Personal REST API", () => {
  test("TL-070 rejects missing and wrong tokens, accepts the configured one", async ({
    request,
  }) => {
    const anonymous = await request.get("/api/personal");
    expect(anonymous.status()).toBe(401);
    const wrong = await request.get("/api/personal", {
      headers: { authorization: "Bearer wrong-token" },
    });
    expect(wrong.status()).toBe(401);
    const ok = await request.get("/api/personal", {
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    expect(ok.status()).toBe(200);
    const data = await ok.json();
    expect(data.state.schemaVersion).toBe(1);
    expect(Array.isArray(data.state.watchlist)).toBe(true);
  });

  test("TL-071 PUT applies newer documents and rejects stale ones", async ({
    request,
  }) => {
    const headers = {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
    };
    const base = {
      schemaVersion: 1,
      positions: [],
      assetTiers: {},
    };
    const newer = await request.put("/api/personal", {
      headers,
      data: {
        state: {
          ...base,
          watchlist: [
            { id: "solana", type: "token", name: "Solana", symbol: "SOL" },
          ],
          updatedAt: "2026-07-21T12:00:00.000Z",
        },
      },
    });
    expect(newer.status()).toBe(200);
    expect((await newer.json()).applied).toBe(true);

    const stale = await request.put("/api/personal", {
      headers,
      data: {
        state: { ...base, watchlist: [], updatedAt: "2026-07-21T11:00:00.000Z" },
      },
    });
    const staleBody = await stale.json();
    expect(staleBody.applied).toBe(false);
    expect(staleBody.state.watchlist).toHaveLength(1);

    const malformed = await request.put("/api/personal", {
      headers,
      data: { state: { schemaVersion: 1 } },
    });
    expect(malformed.status()).toBe(400);
  });
});

test.describe("MCP personal tools", () => {
  test("TL-072 personal tools are listed but refuse calls without the bearer token", async ({
    request,
  }) => {
    const anonymous = await initialize(request);
    const tools = await listToolNames(request, anonymous);
    for (const name of [
      "get_watchlist",
      "add_to_watchlist",
      "remove_from_watchlist",
      "get_portfolio",
      "add_position",
      "remove_position",
    ]) {
      expect(tools).toContain(name);
    }
    const denied = await callTool(request, anonymous, "get_watchlist", {});
    const result = denied.rpc?.result as { isError?: boolean } | undefined;
    expect(result?.isError).toBe(true);
    expect(toolResultJson(result).error).toMatch(/token/i);
  });

  test("TL-073 watchlist round trip: add, read with quotes, remove", async ({
    request,
  }) => {
    const authed = await initialize(request, TOKEN);
    const add = await callTool(request, authed, "add_to_watchlist", {
      id: "chainlink",
      type: "token",
      name: "Chainlink",
      symbol: "LINK",
    });
    expect(toolResultJson(add.rpc?.result).ok).toBe(true);

    const list = await callTool(request, authed, "get_watchlist", {});
    const watchlist = toolResultJson(list.rpc?.result).watchlist as {
      id: string;
      priceUsd: number | null;
    }[];
    const link = watchlist.find((w) => w.id === "chainlink");
    expect(link).toBeDefined();
    expect(link!.priceUsd).not.toBeNull();

    const remove = await callTool(request, authed, "remove_from_watchlist", {
      id: "chainlink",
      type: "token",
    });
    expect(toolResultJson(remove.rpc?.result).ok).toBe(true);
    const after = await callTool(request, authed, "get_watchlist", {});
    const remaining = toolResultJson(after.rpc?.result).watchlist as { id: string }[];
    expect(remaining.find((w) => w.id === "chainlink")).toBeUndefined();
  });

  test("TL-074 portfolio round trip: add lots, valued analysis, remove", async ({
    request,
  }) => {
    const authed = await initialize(request, TOKEN);
    for (const lot of [
      { quantity: 2, costBasisUsd: 300 },
      { quantity: 1, costBasisUsd: 180 },
    ]) {
      const add = await callTool(request, authed, "add_position", {
        id: "solana",
        type: "token",
        name: "Solana",
        symbol: "SOL",
        ...lot,
      });
      expect(toolResultJson(add.rpc?.result).ok).toBe(true);
    }

    const portfolio = await callTool(request, authed, "get_portfolio", {});
    const summary = toolResultJson(portfolio.rpc?.result);
    const lots = summary.positions.filter(
      (p: { assetId: string }) => p.assetId === "solana",
    );
    expect(lots).toHaveLength(2);
    expect(summary.totalValueUsd).toBeGreaterThan(0);
    expect(lots[0].valueUsd).not.toBeNull();
    expect(lots[0].pnlUsd).not.toBeNull();
    expect(summary.tierAllocation.length).toBeGreaterThan(0);
    expect(summary.disclaimer).toContain("not financial advice");

    const remove = await callTool(request, authed, "remove_position", {
      id: "solana",
    });
    expect(toolResultJson(remove.rpc?.result).ok).toBe(true);
    const after = await callTool(request, authed, "get_portfolio", {});
    const remaining = toolResultJson(after.rpc?.result).positions.filter(
      (p: { assetId: string }) => p.assetId === "solana",
    );
    expect(remaining).toHaveLength(0);
  });
});

test.describe("Web UI sync", () => {
  test("TL-075 server personal state appears in the UI after the token is configured", async ({
    page,
    request,
  }) => {
    // Seed the server document directly, stamped newer than any local state.
    const put = await request.put("/api/personal", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
        "content-type": "application/json",
      },
      data: {
        state: {
          schemaVersion: 1,
          watchlist: [
            { id: "chainlink", type: "token", name: "Chainlink", symbol: "LINK" },
          ],
          positions: [
            {
              assetId: "solana",
              assetType: "token",
              name: "Solana",
              symbol: "SOL",
              quantity: 2,
              costBasisUsd: 300,
            },
          ],
          assetTiers: {},
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect((await put.json()).applied).toBe(true);

    // Configure the token in Settings; the sync mount pulls the server doc.
    await page.goto("/settings");
    await page.locator(t(SEL.personalTokenInput)).fill(TOKEN);

    // The pulled state renders on the portfolio page.
    await page.goto("/portfolio");
    await expect(page.locator(t(SEL.positionRow)).first()).toContainText("SOL");
    await expect(page.locator(t(SEL.watchlistSection))).toContainText("LINK");
  });
});
