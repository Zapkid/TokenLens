"use client";

import { useEffect, useState } from "react";
import { ARB_GLOSSARY, ARB_PRACTICE, ARB_STEPS } from "@/lib/arb/content";
import { arbStrings, formatArbDate } from "@/lib/arb/i18n";
import type { ArbLang } from "@/lib/arb/types";
import { LOCAL_NAMESPACE } from "@/lib/privacy";
import { SEL } from "@/lib/selectors";
import { Section, SourceLink } from "../parts";

export function LearnSection({ lang }: { lang: ArbLang }) {
  const t = arbStrings(lang);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const terms = ARB_GLOSSARY.filter(
    (g) => !q || [g.term.en, g.term.he, g.definition.en, g.definition.he].some((s) => s.toLowerCase().includes(q)),
  );
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Section id="learn" kind="learn" lang={lang} title={t.learn}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div data-testid={SEL.arbGlossary}>
          <h3 className="mb-2 text-sm font-semibold">{t.glossary}</h3>
          <input
            type="search"
            data-testid={SEL.arbGlossarySearch}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.glossarySearch}
            aria-label={t.glossarySearch}
            className="mb-2 w-full rounded-md border border-hairline bg-page px-3 py-1.5 text-sm"
          />
          <dl className="space-y-2">
            {terms.map((g) => (
              <div key={g.id} data-testid={SEL.arbGlossaryTerm} className="rounded-lg border border-hairline bg-page px-3 py-2">
                <dt className="text-sm font-medium">{g.term[lang]}</dt>
                <dd className="text-xs text-ink-2">{g.definition[lang]}</dd>
                <dd className="mt-1 text-[11px] text-faint">
                  {t.usedIn}:{" "}
                  {g.questions.map((id, i) => (
                    <span key={id}>
                      {i > 0 ? ", " : ""}
                      <a href={`#q-${id}`} className="text-accent hover:underline">
                        {id}
                      </a>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-testid={SEL.arbPractice}>
          <h3 className="text-sm font-semibold">{t.practice}</h3>
          <p className="mb-2 text-xs text-ink-2">{t.practiceIntro}</p>
          <ul className="space-y-2">
            {ARB_PRACTICE.map((c) => {
              const shown = open.has(c.id);
              return (
                <li key={c.id} className="rounded-lg border border-hairline bg-page px-3 py-2">
                  <p className="text-sm font-medium">
                    <a href={`#q-${c.relates}`} className="tabular me-1 text-accent hover:underline">
                      {c.relates}
                    </a>
                    {c.question[lang]}
                  </p>
                  {shown ? <p className="mt-1 text-xs text-ink-2">{c.answer[lang]}</p> : null}
                  <button
                    type="button"
                    data-testid={SEL.arbPracticeReveal}
                    aria-expanded={shown}
                    onClick={() => toggle(c.id)}
                    className="mt-1 text-xs font-medium text-accent hover:underline"
                  >
                    {shown ? t.hide : t.reveal}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// Inside the app storage namespace so Settings export and erase cover it.
const STEPS_KEY = `${LOCAL_NAMESPACE}arb-steps`;

function readDone(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STEPS_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function PlanSection({ lang }: { lang: ArbLang }) {
  const t = arbStrings(lang);
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => setDone(readDone()), []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(STEPS_KEY, JSON.stringify([...next]));
      } catch {
        // Storage unavailable: progress still works for this visit.
      }
      return next;
    });
  };

  const phases = [...new Set(ARB_STEPS.map((s) => s.phase.en))];
  const count = ARB_STEPS.filter((s) => done.has(s.id)).length;

  return (
    <Section
      id="plan"
      kind="personal"
      lang={lang}
      title={t.plan}
      intro={t.planIntro}
      testId={SEL.arbPlan}
      note={undefined}
    >
      <p data-testid={SEL.arbPlanProgress} className="tabular mb-3 text-sm font-medium">
        {count} / {ARB_STEPS.length} {t.progress}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {phases.map((phase) => {
          const steps = ARB_STEPS.filter((s) => s.phase.en === phase);
          return (
            <div key={phase}>
              <h3 className="mb-2 text-sm font-semibold">{steps[0].phase[lang]}</h3>
              <ul className="space-y-2">
                {steps.map((s) => (
                  <li key={s.id} className="flex gap-2 rounded-lg border border-hairline bg-page px-3 py-2">
                    <input
                      id={`step-${s.id}`}
                      type="checkbox"
                      data-testid={SEL.arbPlanStep}
                      checked={done.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <label htmlFor={`step-${s.id}`} className="text-sm">
                      <span className={`font-medium ${done.has(s.id) ? "text-faint line-through" : ""}`}>{s.title[lang]}</span>
                      <span className="block text-xs text-ink-2">{s.detail[lang]}</span>
                      <span className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-faint">
                        {s.due ? (
                          <span className="tabular">
                            {t.due}: {formatArbDate(s.due, lang)}
                          </span>
                        ) : null}
                        {s.link ? <SourceLink source={s.link} /> : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
