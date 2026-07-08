import { describe, expect, it } from "vitest";
import {
  annualizedVol,
  clamp,
  correlation,
  logReturns,
  maxDrawdown,
  percentileOf,
  simpleMovingAverage,
  trailingReturn,
  winsorize,
} from "../math";

describe("logReturns", () => {
  it("computes daily log returns and skips non-positive prices", () => {
    expect(logReturns([100, 110])).toEqual([Math.log(1.1)]);
    expect(logReturns([100, 0, 110])).toEqual([]);
  });
});

describe("annualizedVol", () => {
  it("returns null with insufficient data", () => {
    expect(annualizedVol([1, 2, 3], 30)).toBeNull();
  });
  it("annualizes the std dev of daily returns", () => {
    // Alternating +1%/-1% daily moves: vol should be near 1% * sqrt(365).
    const closes = [100];
    for (let i = 0; i < 100; i++) {
      closes.push(closes[closes.length - 1] * (i % 2 === 0 ? 1.01 : 0.99));
    }
    const vol = annualizedVol(closes, 100)!;
    expect(vol).toBeGreaterThan(0.15);
    expect(vol).toBeLessThan(0.25);
  });
});

describe("maxDrawdown", () => {
  it("finds the worst peak-to-trough drop", () => {
    expect(maxDrawdown([100, 150, 75, 120])).toBeCloseTo(-0.5);
  });
  it("is zero for a monotonic rise", () => {
    expect(maxDrawdown([1, 2, 3])).toBe(0);
  });
});

describe("trailingReturn", () => {
  it("computes the n-day return", () => {
    const closes = [100, 101, 102, 110];
    expect(trailingReturn(closes, 3)).toBeCloseTo(0.1);
  });
  it("returns null when history is too short", () => {
    expect(trailingReturn([100, 110], 30)).toBeNull();
  });
});

describe("simpleMovingAverage", () => {
  it("averages the trailing window", () => {
    expect(simpleMovingAverage([1, 2, 3, 4], 2)).toBe(3.5);
    expect(simpleMovingAverage([1, 2], 5)).toBeNull();
  });
});

describe("percentileOf", () => {
  it("ranks a value within a cohort", () => {
    const cohort = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentileOf(10, cohort)).toBeGreaterThan(90);
    expect(percentileOf(1, cohort)).toBeLessThan(10);
    expect(percentileOf(5.5, cohort)).toBeCloseTo(50);
  });
  it("returns null for tiny cohorts", () => {
    expect(percentileOf(1, [1, 2])).toBeNull();
  });
});

describe("winsorize", () => {
  it("clamps outliers to cohort bounds", () => {
    const cohort = Array.from({ length: 100 }, (_, i) => i);
    expect(winsorize(1000, cohort)).toBeLessThanOrEqual(95);
    expect(winsorize(-50, cohort)).toBeGreaterThanOrEqual(4);
  });
});

describe("correlation", () => {
  it("is 1 for identical series and -1 for inverted", () => {
    const a = Array.from({ length: 30 }, (_, i) => Math.sin(i));
    expect(correlation(a, a)).toBeCloseTo(1);
    expect(
      correlation(
        a,
        a.map((x) => -x),
      ),
    ).toBeCloseTo(-1);
  });
});

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
