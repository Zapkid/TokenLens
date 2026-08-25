import { afterEach, describe, expect, it, vi } from "vitest";
import {
  _resetOnchainCacheForTests,
  fetchTrendingPools,
  fixtureTrendingPools,
  isOnchainNetwork,
  parseTrendingPools,
} from "../onchain";
import { cgApiBase, cgApiHeaders, cgOnchainBase } from "../providers/coingecko";

afterEach(() => {
  _resetOnchainCacheForTests();
  delete process.env.COINGECKO_API_KEY;
  delete process.env.COINGECKO_API_TIER;
});

describe("coingecko config", () => {
  it("uses the public host and demo header by default", () => {
    expect(cgApiBase("demo")).toBe("https://api.coingecko.com/api/v3");
    expect(cgOnchainBase("demo")).toBe(
      "https://api.coingecko.com/api/v3/onchain",
    );
    expect(cgApiHeaders("k", "demo")).toEqual({ "x-cg-demo-api-key": "k" });
  });

  it("switches host and header for the pro tier", () => {
    expect(cgApiBase("pro")).toBe("https://pro-api.coingecko.com/api/v3");
    expect(cgApiHeaders("k", "pro")).toEqual({ "x-cg-pro-api-key": "k" });
  });

  it("sends no auth header without a key", () => {
    expect(cgApiHeaders(undefined, "demo")).toBeUndefined();
  });
});

describe("parseTrendingPools", () => {
  it("maps the documented response shape", () => {
    const pools = parseTrendingPools({
      data: [
        {
          attributes: {
            name: "WETH / USDC 0.05%",
            address: "0xabc",
            base_token_price_usd: "3313.94",
            reserve_in_usd: "163988541.36",
            price_change_percentage: { h24: "-2.4" },
            volume_usd: { h24: "69004235.9" },
          },
        },
      ],
    });
    expect(pools).toEqual([
      {
        name: "WETH / USDC 0.05%",
        address: "0xabc",
        priceUsd: 3313.94,
        priceChange24hPct: -2.4,
        volume24hUsd: 69004235.9,
        reserveUsd: 163988541.36,
      },
    ]);
  });

  it("drops incomplete rows and keeps unknown numbers as null", () => {
    const pools = parseTrendingPools({
      data: [
        { attributes: { name: "No address" } },
        { attributes: { name: "X / Y", address: "0x1", volume_usd: {} } },
        {},
      ],
    });
    expect(pools).toHaveLength(1);
    expect(pools[0].volume24hUsd).toBeNull();
    expect(pools[0].priceUsd).toBeNull();
  });
});

describe("fixtureTrendingPools", () => {
  it("is deterministic per network and differs across networks", () => {
    expect(fixtureTrendingPools("eth")).toEqual(fixtureTrendingPools("eth"));
    expect(fixtureTrendingPools("eth")).not.toEqual(
      fixtureTrendingPools("solana"),
    );
    expect(fixtureTrendingPools("eth")).toHaveLength(6);
  });

  it("network ids validate through isOnchainNetwork", () => {
    expect(isOnchainNetwork("eth")).toBe(true);
    expect(isOnchainNetwork("dogechain")).toBe(false);
  });
});

describe("fetchTrendingPools", () => {
  const payload = {
    data: [
      {
        attributes: {
          name: "A / B",
          address: "0x1",
          base_token_price_usd: "1",
          reserve_in_usd: "2",
          price_change_percentage: { h24: "3" },
          volume_usd: { h24: "4" },
        },
      },
    ],
  };

  it("calls the demo onchain endpoint with the key header and caches", async () => {
    process.env.COINGECKO_API_KEY = "demo-key";
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(payload), { status: 200 }),
    );
    const first = await fetchTrendingPools("eth", fetchMock as typeof fetch, 0);
    const second = await fetchTrendingPools(
      "eth",
      fetchMock as typeof fetch,
      30_000,
    );
    expect(first).toHaveLength(1);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      "https://api.coingecko.com/api/v3/onchain/networks/eth/trending_pools?page=1",
    );
    expect((init.headers as Record<string, string>)["x-cg-demo-api-key"]).toBe(
      "demo-key",
    );
  });

  it("uses the pro host for pro tier and surfaces HTTP failures", async () => {
    process.env.COINGECKO_API_KEY = "pro-key";
    process.env.COINGECKO_API_TIER = "pro";
    const failing = vi.fn(async () => new Response("no", { status: 429 }));
    await expect(
      fetchTrendingPools("base", failing as typeof fetch, 0),
    ).rejects.toThrow("429");
    const [url] = failing.mock.calls[0] as unknown as [string];
    expect(url).toContain("https://pro-api.coingecko.com/api/v3/onchain/");
  });
});
