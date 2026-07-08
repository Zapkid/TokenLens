import { describe, expect, it } from "vitest";
import { fixtureProvider, synthSeries } from "../fixture";

describe("synthSeries", () => {
  it("is deterministic for the same seed and ends at the target value", () => {
    const a = synthSeries("seed:x", 100, 200, 0.5, 0.1);
    const b = synthSeries("seed:x", 100, 200, 0.5, 0.1);
    expect(a.map((p) => p.v)).toEqual(b.map((p) => p.v));
    expect(a[a.length - 1].v).toBeCloseTo(100);
    expect(a).toHaveLength(200);
  });
  it("differs across seeds", () => {
    const a = synthSeries("seed:x", 100, 200, 0.5, 0.1);
    const b = synthSeries("seed:y", 100, 200, 0.5, 0.1);
    expect(a.map((p) => p.v)).not.toEqual(b.map((p) => p.v));
  });
});

describe("fixtureProvider.search", () => {
  it("finds tokens by symbol and name", async () => {
    const bySymbol = await fixtureProvider.search("SOL");
    expect(bySymbol.some((r) => r.id === "solana" && r.type === "token")).toBe(true);
    const byName = await fixtureProvider.search("uniswap");
    expect(byName[0].id).toBe("uniswap");
  });

  it("returns the chain first for an exact chain name", async () => {
    const results = await fixtureProvider.search("ethereum");
    expect(results[0].type).toBe("chain");
    expect(results[0].id).toBe("ethereum");
    // The ETH token is still offered for disambiguation.
    expect(results.some((r) => r.type === "token" && r.id === "ethereum")).toBe(true);
  });

  it("surfaces ticker collisions for disambiguation instead of silently matching", async () => {
    const results = await fixtureProvider.search("luna");
    const ids = results.map((r) => r.id);
    expect(ids).toContain("terra-luna-2");
    expect(ids).toContain("terra-luna");
  });
});

describe("fixtureProvider library lists", () => {
  it("ranks top tokens by market cap", async () => {
    const tokens = await fixtureProvider.getTopTokens(10);
    expect(tokens[0].asset.id).toBe("bitcoin");
    expect(tokens).toHaveLength(10);
    const caps = tokens.map((t) => t.marketCap ?? 0);
    expect([...caps].sort((a, b) => b - a)).toEqual(caps);
  });
  it("ranks top chains by TVL", async () => {
    const chains = await fixtureProvider.getTopChains(10);
    expect(chains[0].asset.id).toBe("ethereum");
    const tvls = chains.map((c) => c.tvl ?? 0);
    expect([...tvls].sort((a, b) => b - a)).toEqual(tvls);
  });
});
