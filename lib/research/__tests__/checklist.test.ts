import { describe, expect, it } from "vitest";
import {
  CHECKLIST,
  GATE_LABELS,
  STAGE1_GATE_THRESHOLD,
  effectiveScore,
  researchKey,
  summarizeChecklist,
  type AutoAnswer,
  type ChecklistScore,
  type ResearchAnswer,
} from "../checklist";

const ALL_ITEMS = CHECKLIST.flatMap((s) => s.items);

describe("checklist catalog", () => {
  it("has unique section and item keys", () => {
    const sectionKeys = CHECKLIST.map((s) => s.key);
    expect(new Set(sectionKeys).size).toBe(sectionKeys.length);
    const itemKeys = ALL_ITEMS.map((i) => i.key);
    expect(new Set(itemKeys).size).toBe(itemKeys.length);
  });

  it("has no empty sections and covers both research stages", () => {
    for (const s of CHECKLIST) expect(s.items.length).toBeGreaterThan(0);
    expect(CHECKLIST.some((s) => s.stage === 1)).toBe(true);
    expect(CHECKLIST.some((s) => s.stage === 2)).toBe(true);
  });

  it("contains no em dashes in any label or hint", () => {
    const texts = [
      ...CHECKLIST.map((s) => s.label),
      ...ALL_ITEMS.flatMap((i) => [i.label, i.hint ?? ""]),
      ...Object.values(GATE_LABELS),
    ];
    for (const t of texts) expect(t).not.toMatch(/—/);
  });

  it("keeps the research storage key stable", () => {
    expect(researchKey("token", "bitcoin")).toBe("token:bitcoin");
    expect(researchKey("chain", "solana")).toBe("chain:solana");
  });
});

describe("effectiveScore", () => {
  const item = ALL_ITEMS[0];
  const auto: AutoAnswer = { display: "x", suggested: 4, basis: "test" };

  it("prefers the manual score over the auto suggestion", () => {
    expect(effectiveScore(item, { score: 2 }, auto)).toBe(2);
  });

  it("falls back to the auto suggestion, then to null", () => {
    expect(effectiveScore(item, undefined, auto)).toBe(4);
    expect(effectiveScore(item, { note: "just a note" }, auto)).toBe(4);
    expect(effectiveScore(item, undefined, undefined)).toBeNull();
    expect(
      effectiveScore(item, undefined, { display: "x", suggested: null, basis: "t" }),
    ).toBeNull();
  });
});

function answersForStage(stage: 1 | 2, score: ChecklistScore) {
  const answers: Record<string, ResearchAnswer> = {};
  for (const s of CHECKLIST.filter((x) => x.stage === stage)) {
    for (const i of s.items) answers[i.key] = { score };
  }
  return answers;
}

describe("summarizeChecklist", () => {
  it("returns nulls and a locked gate with no answers at all", () => {
    const summary = summarizeChecklist({}, {});
    expect(summary.overall).toBeNull();
    expect(summary.stage1Score).toBeNull();
    expect(summary.gate).toBe("insufficient");
    expect(summary.answered).toBe(0);
    expect(summary.total).toBe(ALL_ITEMS.length);
    for (const s of summary.sections) expect(s.score).toBeNull();
  });

  it("averages per section and overall, one decimal", () => {
    const section = CHECKLIST[0];
    const answers: Record<string, ResearchAnswer> = {
      [section.items[0].key]: { score: 5 },
      [section.items[1].key]: { score: 2 },
    };
    const summary = summarizeChecklist(answers, {});
    const s = summary.sections.find((x) => x.key === section.key)!;
    expect(s.score).toBe(3.5);
    expect(s.answered).toBe(2);
    expect(summary.overall).toBe(3.5);
  });

  it("manual scores override auto suggestions in the rollup", () => {
    const section = CHECKLIST[0];
    const itemKey = section.items[0].key;
    const auto: Record<string, AutoAnswer> = {
      [itemKey]: { display: "x", suggested: 5, basis: "t" },
    };
    expect(summarizeChecklist({}, auto).overall).toBe(5);
    expect(summarizeChecklist({ [itemKey]: { score: 1 } }, auto).overall).toBe(1);
  });

  it("gates deep research on the stage 1 average with enough coverage", () => {
    const good = summarizeChecklist(answersForStage(1, 4), {});
    expect(good.stage1Score).toBe(4);
    expect(good.gate).toBe("proceed");

    const bad = summarizeChecklist(answersForStage(1, 2), {});
    expect(bad.stage1Score).toBeLessThan(STAGE1_GATE_THRESHOLD);
    expect(bad.gate).toBe("stop");
  });

  it("keeps the gate locked when too few stage 1 sections are scored", () => {
    const oneSection = CHECKLIST.find((s) => s.stage === 1)!;
    const answers: Record<string, ResearchAnswer> = {
      [oneSection.items[0].key]: { score: 5 },
    };
    const summary = summarizeChecklist(answers, {});
    expect(summary.stage1Score).toBe(5);
    expect(summary.gate).toBe("insufficient");
  });

  it("stage 2 answers do not move the stage 1 gate", () => {
    const summary = summarizeChecklist(answersForStage(2, 5), {});
    expect(summary.stage1Score).toBeNull();
    expect(summary.gate).toBe("insufficient");
    expect(summary.overall).toBe(5);
  });
});
