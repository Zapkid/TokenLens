import { describe, expect, it } from "vitest";
import { arbFixture, type ArbLive } from "../live";
import { summarizeChecks, verifyArbLive } from "../verify";

const NOW = Date.UTC(2026, 10, 18);

function byId(live: ArbLive | null, now = NOW) {
  return Object.fromEntries(verifyArbLive(live, now).map((c) => [c.id, c]));
}

describe("arb data validity checks (TL-119)", () => {
  it("the fixture passes every consistency, freshness and static-drift check", () => {
    const checks = verifyArbLive(arbFixture(), NOW);
    const counts = summarizeChecks(checks);
    expect(counts.fail).toBe(0);
    expect(counts.skip).toBe(0);
    const c = byId(arbFixture());
    for (const id of ["mcap-consistency", "supply-bounds", "price-freshness", "tvl-freshness", "stables-freshness", "tvl-cross", "price-cross", "stage-static", "ath-static"]) {
      expect(c[id].status, id).toBe("pass");
    }
    // The fixture models a quiet nitro default branch, as seen in git history.
    expect(c["github-coverage"].status).toBe("warn");
    expect(c["github-coverage"].detail.en).toContain("OffchainLabs/nitro");
  });

  it("returns nothing without live data", () => {
    expect(verifyArbLive(null, NOW)).toEqual([]);
  });

  it("flags an inconsistent market cap", () => {
    const live = arbFixture();
    live.market = { ...live.market!, marketCapUsd: live.market!.marketCapUsd! * 1.5 };
    expect(byId(live)["mcap-consistency"].status).toBe("fail");
  });

  it("flags minted inflation as static drift for answer 5.1", () => {
    const live = arbFixture();
    live.market = { ...live.market!, totalSupply: 1.02e10, maxSupply: null };
    const c = byId(live)["supply-bounds"];
    expect(c.status).toBe("warn");
    expect(c.detail.en).toContain("update answer 5.1");
  });

  it("fails impossible supply ordering", () => {
    const live = arbFixture();
    live.market = { ...live.market!, circulatingSupply: 2e10 };
    expect(byId(live)["supply-bounds"].status).toBe("fail");
  });

  it("grades freshness by age", () => {
    const live = arbFixture();
    live.market = { ...live.market!, lastUpdated: new Date(NOW - 5 * 3_600_000).toISOString() };
    expect(byId(live)["price-freshness"].status).toBe("warn");
    live.market = { ...live.market!, lastUpdated: new Date(NOW - 3 * 86_400_000).toISOString() };
    expect(byId(live)["price-freshness"].status).toBe("fail");
    expect(byId(live, NOW + 10 * 86_400_000)["tvl-freshness"].status).toBe("fail");
  });

  it("detects a stage change that makes the static answers stale", () => {
    const live = arbFixture();
    live.l2beat = live.l2beat!.map((p) => (p.slug === "arbitrum" ? { ...p, stage: "Stage 2" } : p));
    const c = byId(live)["stage-static"];
    expect(c.status).toBe("fail");
    expect(c.detail.en).toContain("must be updated");
    expect(c.detail.he).toContain("Stage 2");
  });

  it("explains, not hides, methodology gaps between DefiLlama and ETHBEAT", () => {
    const live = arbFixture();
    live.l2beat = live.l2beat!.map((p) => (p.slug === "arbitrum" ? { ...p, stablecoinUsd: live.stablecoins!.currentUsd * 1.3 } : p));
    const c = byId(live)["stables-cross"];
    expect(c.status).toBe("warn");
    expect(c.detail.en).toContain("Methods differ");
  });

  it("skips (never invents) checks whose inputs are missing", () => {
    const live = { ...arbFixture(), market: null, l2beat: null, github: null, chains: null };
    const c = byId(live);
    for (const id of ["mcap-consistency", "price-freshness", "stage-static", "github-coverage", "tvl-cross"]) {
      expect(c[id].status, id).toBe("skip");
    }
  });

  it("every check is bilingual and cites a source", () => {
    for (const c of verifyArbLive(arbFixture(), NOW)) {
      expect(c.label.he).toMatch(/[֐-׿]/);
      expect(c.detail.he.length).toBeGreaterThan(0);
      expect(c.sources.length).toBeGreaterThan(0);
    }
  });
});
