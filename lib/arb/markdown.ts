import {
  ARB_CATEGORY_LABELS,
  ARB_CHAPTERS,
  ARB_HISTORY,
  ARB_INTRO,
  ARB_RESEARCH_DATE,
  ARB_ROADMAP,
  ARB_ROADMAP_STATUS,
  ARB_TITLE,
} from "./content";
import type { ArbLang } from "./types";

/** Markdown rendition of /arb (Accept: text/markdown), built from the same
 * content model as the page. Live numbers are not included: agents can call
 * /api/arb for them. */
export function arbMarkdown(base: string, lang: ArbLang = "en"): string {
  const lines: string[] = [`# ${ARB_TITLE[lang]}`, "", ARB_INTRO[lang], ""];
  lines.push(`Static answers researched on ${ARB_RESEARCH_DATE}. Live data: ${base}/api/arb`, "");
  lines.push("## History", "");
  for (const e of ARB_HISTORY) {
    lines.push(
      `- ${e.date}, ${ARB_CATEGORY_LABELS[e.category][lang]}: ${e.title[lang]}. ${e.detail[lang]} Why it mattered: ${e.impact[lang]} ([source](${e.source.url}), ${e.verification.status})`,
    );
  }
  lines.push("", "## Roadmap", "");
  for (const r of ARB_ROADMAP) {
    lines.push(`- ${ARB_ROADMAP_STATUS[r.status][lang]}, ${r.when[lang]}: ${r.title[lang]}. ${r.detail[lang]} ([source](${r.source.url}))`);
  }
  for (const c of ARB_CHAPTERS) {
    lines.push("", `## ${c.title[lang]}`);
    for (const q of c.questions) {
      lines.push("", `### ${q.id} ${q.title[lang]}`, "", `> ${q.prompt[lang]}`, "");
      for (const p of q.answer) lines.push(p[lang], "");
      if (q.sources.length) {
        lines.push(`Sources: ${q.sources.map((s) => `[${s.label}](${s.url})`).join("; ")}`);
      }
    }
  }
  return `${lines.join("\n").trim()}\n`;
}
