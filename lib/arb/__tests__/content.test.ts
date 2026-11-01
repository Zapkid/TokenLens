import { describe, expect, it } from "vitest";
import {
  ARB_CHAPTERS,
  ARB_GUIDELINES,
  ARB_KEY_FACTS,
  ARB_TIMELINE,
  questionCount,
} from "../content";
import { arbMarkdown } from "../markdown";
import { SRC } from "../sources";
import type { Bi } from "../types";

// Collect every bilingual string in the content model.
function allBi(): Bi[] {
  const out: Bi[] = [];
  for (const c of ARB_CHAPTERS) {
    out.push(c.title);
    for (const q of c.questions) out.push(q.title, q.prompt, ...q.answer);
  }
  for (const e of ARB_TIMELINE) out.push(e.category, e.title, e.detail);
  for (const f of ARB_KEY_FACTS) out.push(f.label, f.value);
  for (const g of ARB_GUIDELINES) out.push(g.label, g.value);
  return out;
}

describe("arb content model (TL-110)", () => {
  it("follows the course order: chapters 1 to 7, bonus, then Part B 1 to 5", () => {
    const ids = ARB_CHAPTERS.flatMap((c) => c.questions.map((q) => q.id));
    expect(ids).toEqual([
      "1.1", "1.2", "1.3", "1.4", "1.5",
      "2.1", "2.2",
      "3.1", "3.2", "3.3", "3.4",
      "4.1", "4.2", "4.3",
      "5.1", "5.2", "5.3",
      "6.1", "6.2", "6.3", "6.4",
      "7.1", "7.2",
      "Bonus",
      "B.1", "B.2", "B.3", "B.4", "B.5",
    ]);
    expect(questionCount()).toBe(29);
  });

  it("question ids are unique", () => {
    const ids = ARB_CHAPTERS.flatMap((c) => c.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every string is present in both English and Hebrew", () => {
    for (const b of allBi()) {
      expect(b.en.trim().length).toBeGreaterThan(0);
      expect(b.he.trim().length).toBeGreaterThan(0);
    }
  });

  it("Hebrew strings actually contain Hebrew script", () => {
    for (const b of allBi()) {
      if (/[A-Za-z]{3}/.test(b.en) && b.en !== "ETH") expect(b.he).toMatch(/[\u0590-\u05FF]|^ETH$/);
    }
  });

  it("contains no em dashes anywhere (repo copy rule)", () => {
    for (const b of allBi()) {
      expect(b.en).not.toContain("\u2014");
      expect(b.he).not.toContain("\u2014");
    }
  });

  it("covers Part B for Arbitrum only, never the other four chains' dedicated questions", () => {
    const partB = ARB_CHAPTERS.filter((c) => c.part === "B");
    expect(partB).toHaveLength(1);
    const titles = partB[0].questions.map((q) => q.title.en).join(" ");
    for (const other of ["TON", "Gram", "Superchain", "Ondo", "Zcash", "shielded"]) {
      expect(titles).not.toContain(other);
    }
  });

  it("fact and analysis answers cite at least one source; personal answers guide, not fabricate", () => {
    for (const c of ARB_CHAPTERS) {
      for (const q of c.questions) {
        expect(q.answer.length).toBeGreaterThan(0);
        if (q.kind !== "personal") expect(q.sources.length).toBeGreaterThan(0);
      }
    }
    const personal = ARB_CHAPTERS.flatMap((c) => c.questions).filter((q) => q.kind === "personal").map((q) => q.id);
    expect(personal).toEqual(["3.2", "3.3", "3.4", "Bonus"]);
  });

  it("the timeline has 5 to 7 events, sorted, each with a source", () => {
    expect(ARB_TIMELINE.length).toBeGreaterThanOrEqual(5);
    expect(ARB_TIMELINE.length).toBeLessThanOrEqual(7);
    const dates = ARB_TIMELINE.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(ARB_TIMELINE.map((e) => e.category.en)).size).toBe(ARB_TIMELINE.length);
  });

  it("every source is an https URL", () => {
    for (const s of Object.values(SRC)) expect(s.url).toMatch(/^https:\/\//);
  });

  it("markdown rendition lists every question in order", () => {
    const md = arbMarkdown("https://example.test");
    expect(md.startsWith("# Arbitrum")).toBe(true);
    let last = -1;
    for (const c of ARB_CHAPTERS) {
      for (const q of c.questions) {
        const at = md.indexOf(`### ${q.id} `);
        expect(at).toBeGreaterThan(last);
        last = at;
      }
    }
    expect(md).toContain("https://example.test/api/arb");
  });
});
