import { ARB_CHAPTERS, ARB_INTRO, ARB_RESEARCH_DATE, ARB_TIMELINE, ARB_TITLE } from "./content";
import type { ArbLang } from "./types";

/** Markdown rendition of /arb (Accept: text/markdown), built from the same
 * content model as the page. Live numbers are not included: agents can call
 * /api/arb for them. */
export function arbMarkdown(base: string, lang: ArbLang = "en"): string {
  const lines: string[] = [`# ${ARB_TITLE[lang]}`, "", ARB_INTRO[lang], ""];
  lines.push(`Static answers researched on ${ARB_RESEARCH_DATE}. Live data: ${base}/api/arb`, "");
  lines.push("## Timeline", "");
  for (const e of ARB_TIMELINE) {
    lines.push(`- ${e.date}, ${e.category[lang]}: ${e.title[lang]}. ${e.detail[lang]} ([source](${e.source.url}))`);
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
