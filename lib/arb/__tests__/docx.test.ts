import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { ARB_CHAPTERS } from "../content";
import { arbFileName, buildArbDocModel } from "../doc-model";
import { arbDocxBuffer } from "../docx";
import { arbFixture } from "../live";

async function documentXml(lang: "en" | "he") {
  const buf = await arbDocxBuffer(buildArbDocModel(lang, arbFixture()));
  const files = unzipSync(new Uint8Array(buf));
  return {
    doc: strFromU8(files["word/document.xml"]),
    styles: strFromU8(files["word/styles.xml"]),
  };
}

describe("arb Word doc model (TL-112)", () => {
  it("starts with a cover page carrying name, ID and date placeholders", () => {
    const m = buildArbDocModel("he", null);
    expect(m.blocks[0]).toEqual({ type: "title", text: expect.stringContaining("Blockchain Expert") });
    const cover = m.blocks.slice(0, m.blocks.findIndex((b) => b.type === "pageBreak"));
    const text = cover.map((b) => ("text" in b ? b.text : "")).join("\n");
    expect(text).toContain("שם מלא (עברית)");
    expect(text).toContain("שם מלא (אנגלית)");
    expect(text).toContain("מספר זהות");
  });

  it("lists every question in course order with its number", () => {
    const m = buildArbDocModel("en", null);
    const headings = m.blocks.filter((b) => b.type === "heading2").map((b) => ("text" in b ? b.text : ""));
    const ids = ARB_CHAPTERS.flatMap((c) => c.questions.map((q) => q.id));
    expect(headings.map((h) => h.split(" ")[0])).toEqual(ids);
  });

  it("embeds live numbers with a check time and source only when live data exists", () => {
    const without = buildArbDocModel("en", null).blocks.map((b) => ("text" in b ? b.text : "")).join("\n");
    expect(without).not.toContain("Live data snapshot (Checked");
    const withLive = buildArbDocModel("en", arbFixture()).blocks.map((b) => ("text" in b ? b.text : "")).join("\n");
    expect(withLive).toContain("Live data snapshot (Checked 1 Nov 2026 00:00 UTC)");
    expect(withLive).toContain("Synthetic fixture data");
    expect(withLive).toMatch(/Commits: 212 \(Source: GitHub/);
  });

  it("ends with a deduplicated, sorted source list", () => {
    const m = buildArbDocModel("en", arbFixture());
    const idx = m.blocks.findIndex((b) => b.type === "heading1" && b.text === "List of sources");
    const list = m.blocks.slice(idx + 1).map((b) => ("text" in b ? b.text : ""));
    expect(list.length).toBeGreaterThan(10);
    expect(new Set(list).size).toBe(list.length);
    expect([...list].sort((a, b) => a.localeCompare(b))).toEqual(list);
  });

  it("names files by language", () => {
    expect(arbFileName("en")).toMatch(/EN\.docx$/);
    expect(arbFileName("he")).toMatch(/HE\.docx$/);
  });
});

describe("arb .docx formatting rules (TL-112)", () => {
  it("English: Arial, 12 pt, 1.5 line spacing, left to right", async () => {
    const { doc, styles } = await documentXml("en");
    expect(styles).toMatch(/w:ascii="Arial"/);
    expect(doc).toMatch(/w:ascii="Arial"/);
    expect(doc).toMatch(/<w:sz w:val="24"\/>/);
    expect(doc).toMatch(/<w:szCs w:val="24"\/>/);
    expect(doc).toMatch(/w:line="360"/);
    expect(doc).not.toMatch(/<w:bidi\/>/);
    // No other font size sneaks in (headings stay 12 pt as required).
    const sizes = new Set([...doc.matchAll(/<w:sz w:val="(\d+)"\/>/g)].map((m) => m[1]));
    expect([...sizes]).toEqual(["24"]);
  });

  it("Hebrew: same typography plus right-to-left paragraphs and runs", async () => {
    const { doc } = await documentXml("he");
    expect(doc).toMatch(/w:cs="Arial"/);
    expect(doc).toMatch(/<w:bidi\/>/);
    expect(doc).toMatch(/<w:rtl\/>/);
    expect(doc).toMatch(/w:line="360"/);
    expect(doc).toContain("מהות הפרויקט");
  });
});
