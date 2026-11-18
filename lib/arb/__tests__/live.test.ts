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
  parseL2BeatSummary,
  parseLlamaTvl,
  pickRepos,
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

  it("sums all pegged stablecoin buckets and splits native vs bridged", () => {
    const s = parseLlamaStables([
      { date: "100", totalCirculatingUSD: { peggedUSD: 10, peggedEUR: 2 } },
      {
        date: "200",
        totalCirculatingUSD: { peggedUSD: 30 },
        totalMintedUSD: { peggedUSD: 22, peggedEUR: 1 },
        totalBridgedToUSD: { peggedUSD: 7 },
      },
    ]);
    expect(s.currentUsd).toBe(30);
    expect(s.series[0]).toEqual({ t: 100_000, v: 12 });
    expect(s.nativeUsd).toBe(23);
    expect(s.bridgedUsd).toBe(7);
    expect(s.asOf).toBe(200_000);
  });

  it("reads 30 day fees and fails loudly when absent", () => {
    expect(parseLlamaFees({ total30d: 1234 })).toBe(1234);
    expect(() => parseLlamaFees({})).toThrow();
  });

  it("filters chains to the Arbitrum ecosystem then competitors", () => {
    const c = parseLlamaChains([
      { name: "Ethereum", tvl: 1 },
      { name: "OP Mainnet", tvl: 3 },
      { name: "Robinhood Chain", tvl: 5 },
      { name: "Arbitrum", tvl: 2 },
      { name: "Base", tvl: 4 },
    ]);
    expect(c.map((x) => [x.name, x.group])).toEqual([
      ["Arbitrum", "arbitrum"],
      ["Robinhood Chain", "arbitrum"],
      ["Base", "competitor"],
      ["OP Mainnet", "competitor"],
    ]);
    expect(() => parseLlamaChains([{ name: "Solana", tvl: 1 }])).toThrow();
  });

  it("parses the ETHBEAT (L2BEAT) summary: stage, value secured breakdown and risks", () => {
    const p = parseL2BeatSummary({
      projects: {
        arbitrum: {
          slug: "arbitrum",
          name: "Arbitrum One",
          stage: "Stage 1",
          tvs: { breakdown: { total: 9, canonical: 3, native: 2, external: 4, stablecoin: 5 } },
          risks: [{ name: "Exit Window", value: "None", sentiment: "bad" }, { name: 1 }],
        },
        robinhood: { slug: "robinhood", name: "Robinhood Chain", stage: "Stage 0", tvs: { breakdown: { total: 2 } } },
        zk: { slug: "zksync", name: "ZKsync", stage: "Stage 1" },
      },
    });
    expect(p.map((x) => x.slug)).toEqual(["arbitrum", "robinhood"]);
    expect(p[0]).toMatchObject({ stage: "Stage 1", tvsUsd: 9, canonicalUsd: 3, nativeUsd: 2, externalUsd: 4, stablecoinUsd: 5 });
    expect(p[0].risks).toEqual([{ name: "Exit Window", value: "None", sentiment: "bad" }]);
    expect(p[1].canonicalUsd).toBeNull();
    expect(() => parseL2BeatSummary({ projects: {} })).toThrow();
    expect(() => parseL2BeatSummary(null)).toThrow();
  });

  it("picks core repos first, then recently pushed non-fork, non-archived ones", () => {
    const repos = pickRepos(
      [
        { full_name: "OffchainLabs/nitro" },
        { full_name: "OffchainLabs/fork", fork: true },
        { full_name: "OffchainLabs/old", archived: true },
        { full_name: "OffchainLabs/prysm" },
        { full_name: "OffchainLabs/bold" },
      ],
      4,
    );
    expect(repos).toEqual(["OffchainLabs/nitro", "OffchainLabs/nitro-contracts", "OffchainLabs/prysm", "OffchainLabs/bold"]);
    expect(pickRepos(null, 4)).toEqual(["OffchainLabs/nitro", "OffchainLabs/nitro-contracts"]);
  });

  it("dedupes commit authors by login, then email, then name", () => {
    expect(commitAuthorKey({ author: { login: "Alice" } })).toBe("login:alice");
    expect(commitAuthorKey({ author: null, commit: { author: { email: "B@x.io" } } })).toBe("email:b@x.io");
    const g = summarizeCommits([
      { repo: "a/b", commits: [{ author: { login: "alice" } }, { author: { login: "ALICE" } }], truncated: false },
      { repo: "a/c", commits: [{ author: null, commit: { author: { email: "bob@x.io" } } }], truncated: true },
    ]);
    expect(g).toEqual({
      repos: ["a/b", "a/c"],
      commits30d: 3,
      contributors30d: 2,
      truncated: true,
      quietRepos: [],
      latestRelease: null,
    });
    expect(summarizeCommits([{ repo: "a/quiet", commits: [], truncated: false }]).quietRepos).toEqual(["a/quiet"]);
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
    for (const slot of ["market", "supply", "tvl", "stablecoins", "fees", "github", "chains", "l2beat", "trend"] as const) {
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
