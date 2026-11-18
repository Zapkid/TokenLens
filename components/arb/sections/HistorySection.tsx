"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import {
  ARB_CATEGORY_LABELS,
  ARB_ERAS,
  ARB_HISTORY,
  ARB_ROADMAP,
  ARB_ROADMAP_STATUS,
  eraOf,
  historyDateLabel,
} from "@/lib/arb/content";
import { arbStrings } from "@/lib/arb/i18n";
import type { ArbHistoryCategory, ArbLang, ArbRoadmapStatus } from "@/lib/arb/types";
import { SEL } from "@/lib/selectors";
import { Section, SourceLink, VerificationBadge } from "../parts";

const CATEGORIES = Object.keys(ARB_CATEGORY_LABELS) as ArbHistoryCategory[];

export function HistorySection({ lang }: { lang: ArbLang }) {
  const t = arbStrings(lang);
  const [filter, setFilter] = useState<ArbHistoryCategory | "all">("all");
  const events = ARB_HISTORY.filter((e) => filter === "all" || e.category === filter);

  return (
    <Section id="history" kind="static" lang={lang} title={t.history} intro={t.historyIntro} testId={SEL.arbHistory}>
      <div role="group" aria-label={t.history} className="flex flex-wrap gap-1.5">
        {(["all", ...CATEGORIES] as const).map((c) => {
          const active = filter === c;
          const count = c === "all" ? ARB_HISTORY.length : ARB_HISTORY.filter((e) => e.category === c).length;
          return (
            <button
              key={c}
              type="button"
              data-testid={SEL.arbHistoryFilter}
              data-category={c}
              aria-pressed={active}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                active ? "border-transparent text-white" : "border-hairline text-ink-2 hover:text-ink"
              }`}
              style={active ? { background: "var(--series-5)" } : undefined}
            >
              {c === "all" ? t.allCategories : ARB_CATEGORY_LABELS[c][lang]} <span className="tabular opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-6">
        {ARB_ERAS.map((era) => {
          const inEra = events.filter((e) => eraOf(e.date) === era.id);
          if (!inEra.length) return null;
          return (
            <div key={era.id}>
              <h3 className="text-sm font-semibold">{era.title[lang]}</h3>
              <p className="mb-2 text-xs text-ink-2">{era.summary[lang]}</p>
              <ol className="space-y-2 border-s-2 border-hairline ps-4">
                {inEra.map((e) => (
                  <li key={e.id} className="relative" data-testid={SEL.arbHistoryEvent} data-category={e.category}>
                    <span
                      aria-hidden
                      className="absolute -start-[1.4rem] top-3 h-2.5 w-2.5 rounded-full"
                      style={{ background: e.core ? "var(--series-1)" : "var(--baseline)" }}
                    />
                    <details className="group rounded-lg px-1 py-1 open:bg-page">
                      <summary className="cursor-pointer list-none">
                        <span className="tabular text-xs text-faint">
                          {historyDateLabel(e.date, lang)} · {ARB_CATEGORY_LABELS[e.category][lang]}
                        </span>
                        <span className="ms-2 inline-flex flex-wrap gap-1 align-middle">
                          {e.core ? <Badge tone="accent">{t.coreBadge}</Badge> : null}
                        </span>
                        <span className="block text-sm font-medium group-open:text-accent">{e.title[lang]}</span>
                      </summary>
                      <div className="mt-1 space-y-1.5 text-sm">
                        <p className="text-ink-2">{e.detail[lang]}</p>
                        <p>
                          <span className="font-medium">{t.whyItMattered}: </span>
                          {e.impact[lang]}
                        </p>
                        <p className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
                          <VerificationBadge v={e.verification} lang={lang} />
                          <SourceLink source={e.source} />
                          {e.questions?.length ? (
                            <span>
                              {t.usedIn}:{" "}
                              {e.questions.map((q, i) => (
                                <span key={q}>
                                  {i > 0 ? ", " : ""}
                                  <a href={`#q-${q}`} className="text-accent hover:underline">
                                    {q}
                                  </a>
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </p>
                        {e.verification.note ? <p className="text-[11px] text-faint">{e.verification.note[lang]}</p> : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

const ROADMAP_ORDER: ArbRoadmapStatus[] = ["done", "voting", "next", "longterm"];
const ROADMAP_COLOR: Record<ArbRoadmapStatus, string> = {
  done: "var(--status-good)",
  voting: "var(--series-1)",
  next: "var(--series-3)",
  longterm: "var(--muted)",
};

export function RoadmapSection({ lang }: { lang: ArbLang }) {
  const t = arbStrings(lang);
  return (
    <Section id="roadmap" kind="static" lang={lang} title={t.roadmap} intro={t.roadmapIntro} testId={SEL.arbRoadmap}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROADMAP_ORDER.map((status) => (
          <div key={status}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ROADMAP_COLOR[status] }} />
              {ARB_ROADMAP_STATUS[status][lang]}
            </h3>
            <ul className="space-y-2">
              {ARB_ROADMAP.filter((r) => r.status === status).map((r) => (
                <li
                  key={r.id}
                  data-testid={SEL.arbRoadmapItem}
                  data-status={r.status}
                  className="rounded-lg border border-hairline bg-page px-3 py-2"
                >
                  <p className="tabular text-[11px] text-faint">{r.when[lang]}</p>
                  <p className="text-sm font-medium">{r.title[lang]}</p>
                  <p className="mt-1 text-xs text-ink-2">{r.detail[lang]}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-faint">
                    <VerificationBadge v={r.verification} lang={lang} />
                    <SourceLink source={r.source} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
