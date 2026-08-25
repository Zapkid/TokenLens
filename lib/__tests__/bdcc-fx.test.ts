import { describe, expect, it } from "vitest";
import {
  HEBREW_POOL,
  LATIN_POOL,
  countUpDisplay,
  easeOutExpo,
  magneticOffset,
  pointerVars,
  scrambleFrame,
  tiltAngles,
} from "../bdcc-fx";

const rect = { left: 100, top: 50, width: 200, height: 100 };

describe("scrambleFrame", () => {
  const zeroRand = () => 0;

  it("reveals the prefix and scrambles the rest from the pool", () => {
    const out = scrambleFrame("BDCC", 2, zeroRand, LATIN_POOL);
    expect(out.slice(0, 2)).toBe("BD");
    expect(out[2]).toBe(LATIN_POOL[0]);
    expect(out[3]).toBe(LATIN_POOL[0]);
    expect(out).toHaveLength(4);
  });

  it("never scrambles whitespace so word shapes stay stable", () => {
    const out = scrambleFrame("אב גד", 0, zeroRand, HEBREW_POOL);
    expect(out[2]).toBe(" ");
  });

  it("returns the target verbatim once fully revealed", () => {
    expect(scrambleFrame("שלום", 4, zeroRand, HEBREW_POOL)).toBe("שלום");
  });

  it("stays inside the pool even when rand returns values near 1", () => {
    const out = scrambleFrame("XX", 0, () => 0.999999, LATIN_POOL);
    for (const ch of out) expect(LATIN_POOL).toContain(ch);
  });
});

describe("easeOutExpo and countUpDisplay", () => {
  it("clamps easing to [0, 1] and is monotonic", () => {
    expect(easeOutExpo(-1)).toBe(0);
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(2)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(easeOutExpo(0.25));
  });

  it("lands numeric targets exactly on the target string", () => {
    expect(countUpDisplay("2017", 1)).toBe("2017");
    expect(countUpDisplay("2017", 5)).toBe("2017");
    expect(Number(countUpDisplay("2017", 0.5))).toBeLessThanOrEqual(2017);
  });

  it("passes non-numeric targets through untouched", () => {
    expect(countUpDisplay("הסמכה רשמית", 0.3)).toBe("הסמכה רשמית");
  });
});

describe("pointer geometry", () => {
  it("pointerVars is relative to the rect", () => {
    expect(pointerVars(rect, 150, 75)).toEqual({ x: 50, y: 25 });
  });

  it("tiltAngles is zero at center and capped at the edges", () => {
    expect(tiltAngles(rect, 200, 100)).toEqual({ rx: -0, ry: 0 });
    const corner = tiltAngles(rect, 300, 150, 4);
    expect(corner.ry).toBe(4);
    expect(corner.rx).toBe(-4);
    const outside = tiltAngles(rect, 9999, -9999, 4);
    expect(Math.abs(outside.ry)).toBeLessThanOrEqual(4);
    expect(Math.abs(outside.rx)).toBeLessThanOrEqual(4);
  });

  it("magneticOffset pulls toward the cursor and clamps the shift", () => {
    const center = magneticOffset(rect, 200, 100);
    expect(center).toEqual({ dx: 0, dy: 0 });
    const pulled = magneticOffset(rect, 220, 110);
    expect(pulled.dx).toBeCloseTo(5);
    expect(pulled.dy).toBeCloseTo(2.5);
    const far = magneticOffset(rect, 2000, 2000);
    expect(far.dx).toBe(10);
    expect(far.dy).toBe(10);
  });
});
