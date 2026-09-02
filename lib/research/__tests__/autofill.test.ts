import { describe, expect, it } from "vitest";
import type { Metric, Report } from "../../types";
import { CHECKLIST } from "../checklist";
import { buildAutoAnswers, toFiveScale } from "../autofill";

function metric(key: string, value: number | null, percentile: number | null = null): Metric {
  return {
    key,
    label: key,
    family: "market",
    value,
    format: "number",
    direction: "neutral",
    percentile,
  };
}

function reportWith(metrics: Metric[], type: "token" | "chain" = "token"): Report {
  return {
    asset: { id: "test", type, name: "Test", symbol: "TST" },
    metrics,
  } as unknown as Report;
}

describe("toFiveScale", () => {
  it("maps the 0-100 band scale onto 1-5", () => {
    expect(toFiveScale(0)).toBe(1);
    expect(toFiveScale(25)).toBe(2);
    expect(toFiveScale(50)).toBe(3);
    expect(toFiveScale(75)).toBe(4);
    expect(toFiveScale(100)).toBe(5);
    expect(toFiveScale(null)).toBeNull();
  });
});

describe("buildAutoAnswers", () => {
  it("skips items whose source metric is missing", () => {
    const auto = buildAutoAnswers(reportWith([]));
    expect(auto.marketCap).toBeUndefined();
    expect(auto.commitActivity).toBeUndefined();
    expect(auto.dilution).toBeUndefined();
    // Identity items never depend on metrics.
    expect(auto.ticker.display).toBe("TST");
    expect(auto.tokenOrCoin.display).toContain("Token");
  });

  it("labels a chain's native asset and its network items", () => {
    const auto = buildAutoAnswers(
      reportWith(
        [metric("protocolCount", 150), metric("chainFees24h", 1e6)],
        "chain",
      ),
    );
    expect(auto.tokenOrCoin.display).toBe("Native chain asset");
    expect(auto.ecosystemBreadth.suggested).toBe(4);
    expect(auto.networkEconomics.suggested).toBe(3);
  });

  it("suggests turnover scores from the volume share bands", () => {
    const low = buildAutoAnswers(reportWith([metric("turnover", 0.004)]));
    expect(low.volumeShare.suggested).toBe(1);
    const high = buildAutoAnswers(reportWith([metric("turnover", 0.2)]));
    expect(high.volumeShare.suggested).toBe(5);
  });

  it("scores dilution overhang inversely: low overhang is a high score", () => {
    const clean = buildAutoAnswers(reportWith([metric("dilutionOverhang", 0)]));
    expect(clean.dilution.suggested).toBe(5);
    const heavy = buildAutoAnswers(reportWith([metric("dilutionOverhang", 0.85)]));
    expect(heavy.dilution.suggested).toBe(1);
  });

  it("marks a capped max supply above an uncapped one", () => {
    const capped = buildAutoAnswers(reportWith([metric("maxSupply", 21_000_000)]));
    expect(capped.maxSupply.suggested).toBe(4);
    const uncapped = buildAutoAnswers(reportWith([metric("maxSupply", null)]));
    expect(uncapped.maxSupply.display).toBe("No max supply cap");
    expect(uncapped.maxSupply.suggested).toBe(3);
  });

  it("uses developer data bands for GitHub items", () => {
    const auto = buildAutoAnswers(
      reportWith([metric("commits4w", 300), metric("contributors", 5)]),
    );
    expect(auto.commitActivity.suggested).toBe(5);
    expect(auto.contributorCount.suggested).toBe(2);
  });

  it("uses the market cap cohort percentile when present", () => {
    const auto = buildAutoAnswers(reportWith([metric("marketCap", 1e9, 80)]));
    expect(auto.marketCap.suggested).toBe(4);
    expect(auto.marketCap.basis).toContain("percentile 80");
  });

  it("covers every catalog item flagged for autofill when data is complete", () => {
    const auto = buildAutoAnswers(
      reportWith(
        [
          metric("marketCap", 1e9, 80),
          metric("circulatingSupply", 1e8),
          metric("maxSupply", 21_000_000),
          metric("turnover", 0.05),
          metric("athDistance", -0.4),
          metric("dilutionOverhang", 0.2),
          metric("commits4w", 100),
          metric("contributors", 30),
          metric("protocolCount", 150),
          metric("chainFees24h", 1e6),
        ],
        "chain",
      ),
    );
    const flagged = CHECKLIST.flatMap((s) => s.items)
      .filter((i) => i.autofill)
      .map((i) => i.key);
    for (const key of flagged) expect(auto[key], key).toBeDefined();
    // And nothing outside the flagged set gets an auto answer.
    for (const key of Object.keys(auto)) expect(flagged).toContain(key);
  });

  it("informational items carry no suggested score", () => {
    const auto = buildAutoAnswers(
      reportWith([
        metric("circulatingSupply", 1e8),
        metric("athDistance", -0.4),
      ]),
    );
    expect(auto.circulatingSupply.suggested).toBeNull();
    expect(auto.athDistance.suggested).toBeNull();
    expect(auto.athDistance.display).toContain("from ATH");
  });
});
