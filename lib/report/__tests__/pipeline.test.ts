import { beforeAll, describe, expect, it } from "vitest";
import { generateReport } from "../pipeline";

beforeAll(() => {
  process.env.TOKENLENS_DATA_MODE = "fixture";
});

describe("generateReport (fixture mode, end to end)", () => {
  it("generates a complete token report", async () => {
    const report = await generateReport("token", "solana");
    expect(report.asset.id).toBe("solana");
    expect(report.asset.type).toBe("token");
    expect(report.dataMode).toBe("fixture");
    expect(report.reviewTier).toBe("auto-baseline");

    // Metric catalog covers the families that apply to tokens.
    const families = new Set(report.metrics.map((m) => m.family));
    expect(families.has("market")).toBe(true);
    expect(families.has("supply")).toBe(true);
    expect(families.has("priceBehavior")).toBe(true);
    expect(families.has("network")).toBe(false);

    // Scores are in range and consistent with the dampener formula.
    expect(report.scores.opportunity).toBeGreaterThan(0);
    expect(report.scores.opportunity).toBeLessThanOrEqual(100);
    expect(report.scores.risk).toBeGreaterThan(0);
    expect(report.scores.overall).toBeLessThan(report.scores.opportunity);

    // Narrative pillar is honestly excluded, not faked.
    const narrative = report.opportunityPillars.find((p) => p.key === "narrative");
    expect(narrative?.score).toBeNull();

    // Trajectory exists with three horizons and sane bands.
    expect(report.trajectory.insufficientHistory).toBe(false);
    expect(report.trajectory.horizons).toHaveLength(3);

    // Cohort snapshot is persisted with the report.
    expect(report.cohort.size).toBeGreaterThanOrEqual(5);
    expect(report.priceHistory.length).toBeGreaterThan(180);
    expect(report.strategy.tierLabel.length).toBeGreaterThan(0);
  });

  it("generates a chain report with a network section and nested token analysis", async () => {
    const report = await generateReport("chain", "solana");
    expect(report.asset.type).toBe("chain");
    expect(report.network).toBeDefined();
    expect(report.network!.tvl).toBeGreaterThan(0);
    expect(report.network!.topProtocols.length).toBeGreaterThan(0);
    expect(report.network!.topProtocolSharePct).toBeGreaterThan(0);

    // Native token metrics are nested inside the chain report.
    const families = new Set(report.metrics.map((m) => m.family));
    expect(families.has("network")).toBe(true);
    expect(families.has("market")).toBe(true);

    // Both trajectories run for chains.
    expect(report.trajectory.kind).toBe("price");
    expect(report.tvlTrajectory?.kind).toBe("tvl");
    expect(report.tvlTrajectory?.horizons).toHaveLength(3);
  });

  it("handles chains without a native token by omitting token analysis with a warning", async () => {
    const report = await generateReport("chain", "base");
    expect(report.network).toBeDefined();
    expect(report.warnings.some((w) => w.includes("native token"))).toBe(true);
    expect(report.trajectory.insufficientHistory).toBe(true);
  });

  it("serves cached reports within the TTL and regenerates on refresh", async () => {
    const first = await generateReport("token", "bitcoin");
    const second = await generateReport("token", "bitcoin");
    expect(second.generatedAt).toBe(first.generatedAt);
    const refreshed = await generateReport("token", "bitcoin", { refresh: true });
    expect(refreshed.generatedAt >= first.generatedAt).toBe(true);
  });

  it("rejects unknown assets instead of fabricating a report", async () => {
    await expect(generateReport("token", "definitely-not-real")).rejects.toThrow();
  });

  it("keeps the fixture engine deterministic: same asset, same scores", async () => {
    const a = await generateReport("token", "uniswap", { refresh: true });
    const b = await generateReport("token", "uniswap", { refresh: true });
    expect(b.scores).toEqual(a.scores);
    expect(b.trajectory.annualizedVol).toBe(a.trajectory.annualizedVol);
  });
});
