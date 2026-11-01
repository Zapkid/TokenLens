import {
  ARB_CHAPTERS,
  ARB_GUIDELINES,
  ARB_RESEARCH_DATE,
  ARB_TIMELINE,
} from "./content";
import { arbStrings, formatArbDate, formatArbDateTime, kindLabel } from "./i18n";
import type { ArbLive } from "./live";
import { liveFacts } from "./live-format";
import type { ArbLang, ArbSource } from "./types";

// Language-specific, renderer-agnostic outline of the Word paper. Pure, so
// structure (order, cover page, live snapshot lines, sources) is unit
// tested without generating a binary; lib/arb/docx.ts only styles it.

export type ArbDocBlock =
  | { type: "title"; text: string }
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "note"; text: string }
  | { type: "bullet"; text: string }
  | { type: "pageBreak" };

export interface ArbDocModel {
  lang: ArbLang;
  fileName: string;
  blocks: ArbDocBlock[];
}

export function arbFileName(lang: ArbLang): string {
  return lang === "he" ? "Arbitrum-final-project-HE.docx" : "Arbitrum-final-project-EN.docx";
}

export function buildArbDocModel(lang: ArbLang, live: ArbLive | null): ArbDocModel {
  const t = arbStrings(lang);
  const blocks: ArbDocBlock[] = [];
  const sources = new Map<string, ArbSource>();
  const cite = (s: ArbSource) => sources.set(s.url, s);

  // Cover page per the submission rules.
  blocks.push({ type: "title", text: t.coverTitle });
  blocks.push({ type: "paragraph", text: t.coverProject });
  blocks.push({ type: "paragraph", text: `${t.coverNameHe} ____________________` });
  blocks.push({ type: "paragraph", text: `${t.coverNameEn} ____________________` });
  blocks.push({ type: "paragraph", text: `${t.coverId} ____________________` });
  blocks.push({ type: "paragraph", text: `${t.coverDate} ____________________` });
  blocks.push({ type: "pageBreak" });

  blocks.push({ type: "heading1", text: t.guidelines });
  for (const g of ARB_GUIDELINES) blocks.push({ type: "bullet", text: `${g.label[lang]}: ${g.value[lang]}` });
  blocks.push({ type: "note", text: `${t.researchDate} ${formatArbDate(ARB_RESEARCH_DATE, lang)}.` });
  if (live) {
    const when = formatArbDateTime(live.fetchedAt, lang);
    blocks.push({ type: "note", text: `${t.liveSnapshot}: ${t.checked} ${when}.` });
    if (live.mode === "fixture") blocks.push({ type: "note", text: t.liveFixture });
  }

  for (const chapter of ARB_CHAPTERS) {
    blocks.push({ type: "heading1", text: chapter.title[lang] });
    for (const q of chapter.questions) {
      blocks.push({ type: "heading2", text: `${q.id} ${q.title[lang]}` });
      blocks.push({ type: "note", text: `${t.question}: ${q.prompt[lang]}` });
      if (q.kind === "personal") blocks.push({ type: "note", text: `${t.personalNote} ${kindLabel(q.kind, lang)}` });
      for (const p of q.answer) blocks.push({ type: "paragraph", text: p[lang] });

      if (q.id === "2.1") {
        for (const e of ARB_TIMELINE) {
          blocks.push({
            type: "bullet",
            text: `${formatArbDate(e.date, lang)}, ${e.category[lang]}: ${e.title[lang]}. ${e.detail[lang]} (${t.source}: ${e.source.label})`,
          });
          cite(e.source);
        }
      }

      if (live && q.live?.length) {
        const facts = q.live.flatMap((slot) => liveFacts(live, slot, lang));
        if (facts.length) {
          const when = formatArbDateTime(live.fetchedAt, lang);
          blocks.push({ type: "note", text: `${t.liveSnapshot} (${t.checked} ${when}):` });
          for (const f of facts) {
            blocks.push({ type: "bullet", text: `${f.label}: ${f.value} (${t.source}: ${f.source.label})` });
            cite(f.source);
          }
        }
      }

      if (q.sources.length) {
        blocks.push({ type: "note", text: `${t.sources}: ${q.sources.map((s) => s.label).join("; ")}` });
        q.sources.forEach(cite);
      }
    }
  }

  blocks.push({ type: "pageBreak" });
  blocks.push({ type: "heading1", text: t.sourcesList });
  for (const s of [...sources.values()].sort((a, b) => a.label.localeCompare(b.label))) {
    blocks.push({ type: "bullet", text: `${s.label}: ${s.url}` });
  }

  return { lang, fileName: arbFileName(lang), blocks };
}
