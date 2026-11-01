import { describe, expect, it } from "vitest";
import {
  arbFixture,
  buildTrend,
  commitAuthorKey,
  parseCoinGeckoChart,
  parseCoinGeckoCoin,
  parseLlamaChains,
  parseLlamaFees,
  parseLlamaStables,
  parseLlamaTvl,
  summarizeCommits,
} from "../live";
import { liveFacts } from "../live-format";

const DAY = 86_400_000;

describe("arb live parsers (TL-111)", () => {
  it("parses CoinGecko coin market data", () => {
    const m = parseCoinGeckoCoin({
      market_data: {
        current_price: { usd: 0.17 },
        price_change_percentage_24h: -2.5,
        market_cap: { usd: 1.1e9 },
        fully_diluted_valuation: { usd: 1.7e9 },
        circulating_supply: 6.5e9,
        total_supply: 1e10,
        ath: { usd: 2.39 },
        ath_date: { usd: "2024-01-12T00:00:00.000Z" },
      },
    });
    expect(m.priceUsd).toBe(0.17);
    expect(m.circulatingSupply).toBe(6.5e9);
    expect(m.athDate).toBe("2024-01-12T00:00:00.000Z");
  });

  it("rejects a CoinGecko payload without a price instead of inventing one", () => {
    expect(() => parseCoinGeckoCoin({ market_data: {} })).toThrow();
    expect(() => parseCoinGeckoCoin(null)).toThrow();
  });

  it("parses the price chart and skips malformed points", () => {
    expect(parseCoinGeckoChart({ prices: [[1, 2], ["x", 3], [4, 5]] })).toEqual([
      { t: 1, v: 2 },
      { t: 4, v: 5 },
    ]);
    expect(parseCoinGeckoChart({})).toEqual([]);
  });

  it("parses TVL history, computes the 30 day change, and trims to a year", () => {
    const rows = Array.from({ length: 400 }, (_, i) => ({ date: (i * DAY) / 1000, tvl: 100 + i }));
    const tvl = parseLlamaTvl(rows);
    expect(tvl.currentUsd).toBe(499);
    expect(tvl.change30dPct).toBeCloseTo(499 / 469 - 1, 6);
    expect(tvl.series.length).toBe(366);
    expect(() => parseLlamaTvl([])).toThrow();
  });

  it("sums all pegged stablecoin buckets", () => {
    const s = parseLlamaStables([
      { date: "100", totalCirculatingUSD: { peggedUSD: 10, peggedEUR: 2 } },
      { date: "200", totalCirculatingUSD: { peggedUSD: 30 } },
    ]);
    expect(s.currentUsd).toBe(30);
    expect(s.series[0]).toEqual({ t: 100_000, v: 12 });
  });

  it("reads 30 day fees and fails loudly when absent", () => {
    expect(parseLlamaFees({ total30d: 1234 })).toBe(1234);
    expect(() => parseLlamaFees({})).toThrow();
  });

  it("filters the competitor set, Arbitrum first", () => {
    const c = parseLlamaChains([
      { name: "Ethereum", tvl: 1 },
      { name: "OP Mainnet", tvl: 3 },
      { name: "Arbitrum", tvl: 2 },
      { name: "Base", tvl: 4 },
    ]);
    expect(c.map((x) => x.name)).toEqual(["Arbitrum", "Base", "OP Mainnet"]);
    expect(() => parseLlamaChains([{ name: "Solana", tvl: 1 }])).toThrow();
  });

  it("dedupes commit authors by login, then email, then name", () => {
    expect(commitAuthorKey({ author: { login: "Alice" } })).toBe("login:alice");
    expect(commitAuthorKey({ author: null, commit: { author: { email: "B@x.io" } } })).toBe("email:b@x.io");
    const g = summarizeCommits([
      { repo: "a/b", commits: [{ author: { login: "alice" } }, { author: { login: "ALICE" } }], truncated: false },
      { repo: "a/c", commits: [{ author: null, commit: { author: { email: "bob@x.io" } } }], truncated: true },
    ]);
    expect(g).toEqual({ repos: ["a/b", "a/c"], commits30d: 3, contributors30d: 2, truncated: true });
  });

  it("indexes the trend to 100 on the first shared day", () => {
    const pts = (vals: number[], offset = 0) => vals.map((v, i) => ({ t: (i + offset) * DAY, v }));
    const trend = buildTrend(pts([2, 4, 1]), pts([10, 20], 1), pts([5, 5, 10]));
    expect(trend[0]).toEqual({ t: DAY, price: 100, tvl: 100, stables: 100 });
    expect(trend[1]).toEqual({ t: 2 * DAY, price: 25, tvl: 200, stables: 200 });
    expect(buildTrend([], [], [])).toEqual([]);
  });

  it("fixture is deterministic and flagged as fixture", () => {
    const a = arbFixture();
    expect(a).toEqual(arbFixture());
    expect(a.mode).toBe("fixture");
    expect(a.trend.length).toBeGreaterThan(300);
    expect(a.errors).toEqual([]);
  });
});

describe("arb live facts formatting (TL-111)", () => {
  it("formats every slot with a source and skips missing data", () => {
    const live = arbFixture();
    for (const slot of ["market", "supply", "tvl", "stablecoins", "fees", "github", "competitors", "trend"] as const) {
      const facts = liveFacts(live, slot, "en");
      expect(facts.length).toBeGreaterThan(0);
      for (const f of facts) expect(f.source.url).toMatch(/^https:/);
    }
    expect(liveFacts(null, "market", "en")).toEqual([]);
    expect(liveFacts({ ...live, market: null }, "market", "en")).toEqual([]);
  });

  it("labels in Hebrew for the Hebrew page", () => {
    const facts = liveFacts(arbFixture(), "market", "he");
    expect(facts[0].label).toBe("מחיר ARB");
  });
});
