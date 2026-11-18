import { describe, expect, it } from "vitest";
import {
  ARB_CATEGORY_LABELS,
  ARB_CHAPTERS,
  ARB_ERAS,
  ARB_GLOSSARY,
  ARB_GUIDELINES,
  ARB_HISTORY,
  ARB_KEY_FACTS,
  ARB_PRACTICE,
  ARB_RESEARCH_DATE,
  ARB_ROADMAP,
  ARB_ROADMAP_STATUS,
  ARB_STEPS,
  ARB_TIMELINE,
  eraOf,
  historyDateLabel,
  questionCount,
} from "../content";
import { arbMarkdown } from "../markdown";
import { SRC } from "../sources";
import type { Bi } from "../types";

const QUESTION_IDS = new Set(ARB_CHAPTERS.flatMap((c) => c.questions.map((q) => q.id)));

// Collect every bilingual string in the content model.
function allBi(): Bi[] {
  const out: Bi[] = [];
  for (const c of ARB_CHAPTERS) {
    out.push(c.title);
    for (const q of c.questions) out.push(q.title, q.prompt, ...q.answer);
  }
  for (const e of ARB_HISTORY) {
    out.push(e.title, e.detail, e.impact);
    if (e.verification.note) out.push(e.verification.note);
  }
  for (const e of ARB_ERAS) out.push(e.title, e.summary);
  out.push(...Object.values(ARB_CATEGORY_LABELS), ...Object.values(ARB_ROADMAP_STATUS));
  for (const r of ARB_ROADMAP) out.push(r.title, r.detail, r.when);
  for (const f of ARB_KEY_FACTS) {
    out.push(f.label, f.value);
    if (f.verification.note) out.push(f.verification.note);
  }
  for (const g of ARB_GUIDELINES) out.push(g.label, g.value);
  for (const g of ARB_GLOSSARY) out.push(g.term, g.definition);
  for (const p of ARB_PRACTICE) out.push(p.question, p.answer);
  for (const s of ARB_STEPS) out.push(s.phase, s.title, s.detail);
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
    expect(QUESTION_IDS.size).toBe(29);
  });

  it("every string is present in both English and Hebrew, Hebrew in Hebrew script", () => {
    for (const b of allBi()) {
      expect(b.en.trim().length).toBeGreaterThan(0);
      expect(b.he.trim().length).toBeGreaterThan(0);
      if (/[A-Za-z]{3}/.test(b.en) && !/^[A-Za-z0-9 .:,()"\u200f-]+$/.test(b.he)) {
        expect(b.he).toMatch(/[\u0590-\u05FF]/);
      }
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

  it("fact and analysis answers cite sources; personal answers are limited to the student's own work", () => {
    for (const c of ARB_CHAPTERS) {
      for (const q of c.questions) {
        expect(q.answer.length).toBeGreaterThan(0);
        if (q.kind !== "personal") expect(q.sources.length).toBeGreaterThan(0);
      }
    }
    const personal = ARB_CHAPTERS.flatMap((c) => c.questions).filter((q) => q.kind === "personal").map((q) => q.id);
    expect(personal).toEqual(["3.2", "3.3", "3.4", "Bonus"]);
  });

  it("every source is an https URL with a label", () => {
    for (const s of Object.values(SRC)) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.label.length).toBeGreaterThan(5);
    }
  });

  it("markdown rendition lists history, roadmap and every question in order", () => {
    const md = arbMarkdown("https://example.test");
    expect(md.startsWith("# Arbitrum")).toBe(true);
    expect(md).toContain("## History");
    expect(md).toContain("## Roadmap");
    let last = -1;
    for (const id of QUESTION_IDS) {
      const at = md.indexOf(`### ${id} `);
      expect(at).toBeGreaterThan(last);
      last = at;
    }
    expect(md).toContain("https://example.test/api/arb");
  });
});

describe("arb history, roadmap and verification metadata (TL-118)", () => {
  it("history is sorted, unique, sourced and verified on the research date", () => {
    const dates = ARB_HISTORY.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(ARB_HISTORY.map((e) => e.id)).size).toBe(ARB_HISTORY.length);
    for (const e of ARB_HISTORY) {
      expect(e.date).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      expect(e.source.url).toMatch(/^https:/);
      expect(e.verification.checkedOn).toBe(ARB_RESEARCH_DATE);
      if (e.verification.status === "conflicting") expect(e.verification.note).toBeDefined();
    }
    expect(ARB_HISTORY.length).toBeGreaterThanOrEqual(20);
  });

  it("question 2.1 uses 5 to 7 core events across at least 5 categories", () => {
    expect(ARB_TIMELINE.length).toBeGreaterThanOrEqual(5);
    expect(ARB_TIMELINE.length).toBeLessThanOrEqual(7);
    expect(new Set(ARB_TIMELINE.map((e) => e.category)).size).toBeGreaterThanOrEqual(5);
    expect(ARB_TIMELINE.every((e) => e.date.length === 10)).toBe(true);
  });

  it("every event falls in a known era and every era has events", () => {
    const eras = new Set(ARB_ERAS.map((e) => e.id));
    for (const e of ARB_HISTORY) expect(eras.has(eraOf(e.date))).toBe(true);
    for (const era of ARB_ERAS) expect(ARB_HISTORY.some((e) => eraOf(e.date) === era.id)).toBe(true);
  });

  it("formats partial dates at their own precision", () => {
    expect(historyDateLabel("2019", "en")).toBe("2019");
    expect(historyDateLabel("2025-04", "en")).toBe("Apr 2025");
    expect(historyDateLabel("2025-04", "he")).toBe("04.2025");
    expect(historyDateLabel("2026-10-30", "en")).toBe("30 Oct 2026");
    expect(historyDateLabel("2026-10-30", "he")).toBe("30.10.2026");
  });

  it("cross-references (history, glossary, practice) point at real questions", () => {
    for (const e of ARB_HISTORY) for (const q of e.questions ?? []) expect(QUESTION_IDS.has(q)).toBe(true);
    for (const g of ARB_GLOSSARY) for (const q of g.questions) expect(QUESTION_IDS.has(q)).toBe(true);
    for (const p of ARB_PRACTICE) expect(QUESTION_IDS.has(p.relates)).toBe(true);
  });

  it("roadmap covers every status with unique, sourced items", () => {
    expect(new Set(ARB_ROADMAP.map((r) => r.id)).size).toBe(ARB_ROADMAP.length);
    for (const s of Object.keys(ARB_ROADMAP_STATUS)) expect(ARB_ROADMAP.some((r) => r.status === s)).toBe(true);
    for (const r of ARB_ROADMAP) expect(r.source.url).toMatch(/^https:/);
  });

  it("every key fact carries a verification status and conflicts explain themselves", () => {
    for (const f of ARB_KEY_FACTS) {
      expect(["primary", "secondary", "derived", "conflicting"]).toContain(f.verification.status);
      if (f.verification.status === "conflicting") expect(f.verification.note).toBeDefined();
    }
  });

  it("the step plan ends by the submission deadline and has unique ids", () => {
    expect(new Set(ARB_STEPS.map((s) => s.id)).size).toBe(ARB_STEPS.length);
    for (const s of ARB_STEPS) if (s.due) expect(s.due <= "2027-03-30").toBe(true);
    const dues = ARB_STEPS.map((s) => s.due).filter((d): d is string => !!d);
    expect([...dues].sort()).toEqual(dues);
  });
});
