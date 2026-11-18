"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import {
  ARB_CATEGORY_LABELS,
  ARB_CHAPTERS,
  ARB_COURSE_DOC_URL,
  ARB_GUIDELINES,
  ARB_INTRO,
  ARB_KEY_FACTS,
  ARB_RESEARCH_DATE,
  ARB_TIMELINE,
  ARB_TITLE,
  historyDateLabel,
} from "@/lib/arb/content";
import { arbStrings, formatArbDate, formatArbDateTime, kindLabel, langDir, parseLang } from "@/lib/arb/i18n";
import type { ArbLive } from "@/lib/arb/live";
import { liveFacts } from "@/lib/arb/live-format";
import type { ArbAnswerKind, ArbLang, ArbLiveSlot, ArbQuestion } from "@/lib/arb/types";
import { LOCAL_NAMESPACE } from "@/lib/privacy";
import { SEL } from "@/lib/selectors";
import { ArbTrendChart } from "./ArbTrendChart";
import { FactTiles, KIND_COLOR, KindTag, Section, SourceLink, VerificationBadge, type ArbSectionKind } from "./parts";
import { HistorySection, RoadmapSection } from "./sections/HistorySection";
import { LearnSection, PlanSection } from "./sections/LearnSection";
import { chartMarkers, LiveSection, type LiveState } from "./sections/LiveSection";

// Inside the app storage namespace so Settings export and erase cover it.
const LANG_KEY = `${LOCAL_NAMESPACE}arb-lang`;

const KIND_TONE: Record<ArbAnswerKind, "neutral" | "accent" | "warning"> = {
  fact: "neutral",
  analysis: "accent",
  personal: "warning",
};

function readInitialLang(): ArbLang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q) return parseLang(q);
    return parseLang(window.localStorage.getItem(LANG_KEY));
  } catch {
    return "en";
  }
}

function LiveSlots({ live, slots, lang }: { live: ArbLive | null; slots: ArbLiveSlot[]; lang: ArbLang }) {
  const facts = slots.filter((s) => s !== "trend").flatMap((s) => liveFacts(live, s, lang));
  if (!live || !facts.length) return null;
  const t = arbStrings(lang);
  return (
    <div className="mt-3 rounded-lg border border-dashed p-3" style={{ borderColor: KIND_COLOR.live }}>
      <p className="mb-2">
        <KindTag kind="live" lang={lang} note={`${t.checked} ${formatArbDateTime(live.fetchedAt, lang)}`} />
      </p>
      <FactTiles facts={facts} />
    </div>
  );
}

function Timeline({ lang }: { lang: ArbLang }) {
  return (
    <ol data-testid={SEL.arbTimeline} className="mt-3 space-y-3 border-s-2 border-hairline ps-4">
      {ARB_TIMELINE.map((e) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -start-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--series-1)" }}
          />
          <p className="tabular text-xs text-faint">
            {historyDateLabel(e.date, lang)} · {ARB_CATEGORY_LABELS[e.category][lang]}
          </p>
          <p className="text-sm font-medium">{e.title[lang]}</p>
          <p className="text-sm text-ink-2">{e.detail[lang]}</p>
          <p className="text-[11px] text-faint">
            <SourceLink source={e.source} />
          </p>
        </li>
      ))}
    </ol>
  );
}

function QuestionCard({ q, lang, live }: { q: ArbQuestion; lang: ArbLang; live: ArbLive | null }) {
  const t = arbStrings(lang);
  return (
    <article id={`q-${q.id}`} data-testid={SEL.arbQuestion} data-question-id={q.id} className="scroll-mt-20">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">
            <span className="tabular me-1 text-accent">{q.id}</span> {q.title[lang]}
          </h3>
          <Badge tone={KIND_TONE[q.kind]}>{kindLabel(q.kind, lang)}</Badge>
        </div>
        <p className="mt-2 rounded-md bg-page px-3 py-2 text-sm text-ink-2">
          <span className="font-medium">{t.question}:</span> {q.prompt[lang]}
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed">
          {q.answer.map((p, i) => (
            <p key={i}>{p[lang]}</p>
          ))}
        </div>
        {q.id === "2.1" ? <Timeline lang={lang} /> : null}
        {q.live ? <LiveSlots live={live} slots={q.live} lang={lang} /> : null}
        {q.live?.includes("trend") && live ? (
          <div className="mt-3">
            <ArbTrendChart
              data={live.trend}
              labels={{ title: t.trend, price: t.trendPrice, tvl: t.trendTvl, stables: t.trendStables }}
              markers={chartMarkers(lang)}
              markerNote={t.eventMarkers}
            />
          </div>
        ) : null}
        {q.sources.length ? (
          <p className="mt-3 text-xs text-faint">
            {t.sources}:{" "}
            {q.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? "; " : ""}
                <SourceLink source={s} />
              </span>
            ))}
          </p>
        ) : null}
      </Card>
    </article>
  );
}

export function ArbPage() {
  const [lang, setLang] = useState<ArbLang>("en");
  const [live, setLive] = useState<LiveState>({ status: "loading" });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const t = arbStrings(lang);
  const liveData = live.status === "ready" ? live.data : null;

  useEffect(() => {
    setLang(readInitialLang());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/arb")
      .then((r) => (r.ok ? (r.json() as Promise<ArbLive>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) setLive({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setLive({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleLang = useCallback(() => {
    const next: ArbLang = lang === "en" ? "he" : "en";
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
      const url = new URL(window.location.href);
      if (next === "he") url.searchParams.set("lang", "he");
      else url.searchParams.delete("lang");
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Storage or history unavailable: the toggle still works in memory.
    }
  }, [lang]);

  const download = useCallback(async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      // Loaded on demand so the docx library stays out of the page bundle.
      const [{ buildArbDocModel }, { arbDocxBlob }] = await Promise.all([
        import("@/lib/arb/doc-model"),
        import("@/lib/arb/docx"),
      ]);
      const model = buildArbDocModel(lang, liveData);
      const blob = await arbDocxBlob(model);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = model.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  }, [lang, liveData]);

  const nav: { id: string; label: string; kind: ArbSectionKind }[] = [
    { id: "guidelines", label: t.guidelines, kind: "course" },
    { id: "plan", label: t.plan, kind: "personal" },
    { id: "facts", label: t.keyFacts, kind: "static" },
    { id: "live", label: t.live, kind: "live" },
    { id: "history", label: t.history, kind: "static" },
    { id: "roadmap", label: t.roadmap, kind: "static" },
    { id: "learn", label: t.learn, kind: "learn" },
    { id: "partA", label: t.partA, kind: "answers" },
    { id: "partB", label: t.partB, kind: "answers" },
  ];

  const partA = ARB_CHAPTERS.filter((c) => c.part === "A");
  const partB = ARB_CHAPTERS.filter((c) => c.part === "B");

  return (
    <div data-testid={SEL.arbRoot} dir={langDir(lang)} lang={lang} className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{ARB_TITLE[lang]}</h1>
          <div className="no-print flex flex-wrap gap-2">
            <button
              type="button"
              data-testid={SEL.arbLangToggle}
              onClick={toggleLang}
              aria-label={t.switchLabel}
              lang={lang === "en" ? "he" : "en"}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm font-medium shadow-sm hover:text-accent"
            >
              {t.switchTo}
            </button>
            <button
              type="button"
              data-testid={SEL.arbDownload}
              onClick={download}
              disabled={downloading}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm disabled:opacity-60"
              style={{ background: "var(--series-1)" }}
            >
              {downloading ? t.downloading : t.download}
            </button>
          </div>
        </div>
        {downloadError ? (
          <p data-testid={SEL.arbDownloadError} role="alert" className="text-sm text-down">
            {t.downloadFailed}
          </p>
        ) : null}
        <p className="max-w-3xl text-sm text-ink-2">{ARB_INTRO[lang]}</p>
        <p className="text-xs text-faint">
          {t.researchDate} {formatArbDate(ARB_RESEARCH_DATE, lang)} ·{" "}
          <a href={ARB_COURSE_DOC_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {t.courseDoc}
          </a>
        </p>
        <div data-testid={SEL.arbKindLegend} className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-xs font-medium text-ink-2">{t.legend}:</span>
          {(["course", "personal", "static", "live", "learn", "answers"] as ArbSectionKind[]).map((k) => (
            <KindTag key={k} kind={k} lang={lang} />
          ))}
        </div>
        <nav
          aria-label={t.contents}
          data-testid={SEL.arbSectionNav}
          className="no-print sticky top-14 z-10 -mx-1 flex gap-1.5 overflow-x-auto bg-page/90 px-1 py-2 text-xs backdrop-blur scrollbar-none"
        >
          {nav.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 text-ink-2 hover:text-ink"
            >
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR[l.kind] }} />
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="guidelines" kind="course" lang={lang} title={t.guidelines} testId={SEL.arbGuidelines}>
        <dl className="grid gap-3 sm:grid-cols-2">
          {ARB_GUIDELINES.map((g) => (
            <div key={g.label.en}>
              <dt className="text-xs font-medium text-faint">{g.label[lang]}</dt>
              <dd className="text-sm">{g.value[lang]}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <PlanSection lang={lang} />

      <Section
        id="facts"
        kind="static"
        lang={lang}
        title={t.keyFacts}
        testId={SEL.arbKeyFacts}
        note={`${t.checked} ${formatArbDate(ARB_RESEARCH_DATE, lang)}`}
      >
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARB_KEY_FACTS.map((f) => (
            <div key={f.label.en} className="rounded-lg border border-hairline bg-page px-3 py-2">
              <dt className="text-xs text-faint">{f.label[lang]}</dt>
              <dd className="text-sm font-medium">{f.value[lang]}</dd>
              <dd className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-faint">
                <VerificationBadge v={f.verification} lang={lang} />
                <SourceLink source={f.source} />
              </dd>
              {f.verification.note ? <dd className="mt-0.5 text-[11px] text-faint">{f.verification.note[lang]}</dd> : null}
            </div>
          ))}
        </dl>
      </Section>

      <LiveSection live={live} lang={lang} />
      <HistorySection lang={lang} />
      <RoadmapSection lang={lang} />
      <LearnSection lang={lang} />

      {[
        { id: "partA", heading: t.partA, chapters: partA },
        { id: "partB", heading: t.partB, chapters: partB },
      ].map((part) => (
        <div key={part.id} id={part.id} className="scroll-mt-28 space-y-4">
          <div>
            <KindTag kind="answers" lang={lang} />
            <h2 className="text-xl font-bold">{part.heading}</h2>
          </div>
          {part.chapters.map((c) => (
            <section key={c.id} id={c.id} data-testid={SEL.arbChapter} className="scroll-mt-28 space-y-3">
              <h2 className="text-lg font-semibold">{c.title[lang]}</h2>
              {c.questions.map((q) => (
                <QuestionCard key={q.id} q={q} lang={lang} live={liveData} />
              ))}
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}
