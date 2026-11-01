"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import {
  ARB_CHAPTERS,
  ARB_COURSE_DOC_URL,
  ARB_GUIDELINES,
  ARB_INTRO,
  ARB_KEY_FACTS,
  ARB_RESEARCH_DATE,
  ARB_TIMELINE,
  ARB_TITLE,
} from "@/lib/arb/content";
import {
  arbStrings,
  formatArbDate,
  formatArbDateTime,
  kindLabel,
  langDir,
  parseLang,
} from "@/lib/arb/i18n";
import type { ArbLive } from "@/lib/arb/live";
import { liveFacts, type ArbLiveFact } from "@/lib/arb/live-format";
import type { ArbAnswerKind, ArbLang, ArbLiveSlot, ArbQuestion, ArbSource } from "@/lib/arb/types";
import { LOCAL_NAMESPACE } from "@/lib/privacy";
import { SEL } from "@/lib/selectors";
import { ArbTrendChart } from "./ArbTrendChart";

// Inside the app storage namespace so Settings export and erase cover it.
const LANG_KEY = `${LOCAL_NAMESPACE}arb-lang`;

const KIND_TONE: Record<ArbAnswerKind, "neutral" | "accent" | "warning"> = {
  fact: "neutral",
  analysis: "accent",
  personal: "warning",
};

type LiveState = { status: "loading" } | { status: "error" } | { status: "ready"; data: ArbLive };

function readInitialLang(): ArbLang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q) return parseLang(q);
    return parseLang(window.localStorage.getItem(LANG_KEY));
  } catch {
    return "en";
  }
}

function SourceLink({ source }: { source: ArbSource }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
      {source.label}
    </a>
  );
}

function FactTiles({ facts }: { facts: ArbLiveFact[] }) {
  if (!facts.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((f) => (
        <div
          key={`${f.label}-${f.source.url}`}
          data-testid={SEL.arbLiveTile}
          className="rounded-lg border border-hairline bg-page px-3 py-2"
        >
          <dt className="text-xs text-faint">{f.label}</dt>
          <dd className="tabular mt-0.5 break-words text-sm font-semibold">{f.value}</dd>
          <dd className="mt-0.5 text-[11px] text-faint">
            <SourceLink source={f.source} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LiveSlots({ live, slots, lang }: { live: ArbLive | null; slots: ArbLiveSlot[]; lang: ArbLang }) {
  const facts = slots.filter((s) => s !== "trend").flatMap((s) => liveFacts(live, s, lang));
  if (!live || !facts.length) return null;
  const t = arbStrings(lang);
  return (
    <div className="mt-3 rounded-lg border border-dashed border-hairline p-3">
      <p className="mb-2 text-xs text-faint">
        {t.live}, {t.checked} {formatArbDateTime(live.fetchedAt, lang)}
      </p>
      <FactTiles facts={facts} />
    </div>
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
        {q.id === "2.1" ? <Timeline lang={lang} compact /> : null}
        {q.live ? <LiveSlots live={live} slots={q.live} lang={lang} /> : null}
        {q.live?.includes("trend") && live ? (
          <div className="mt-3">
            <ArbTrendChart
              data={live.trend}
              labels={{ title: t.trend, price: t.trendPrice, tvl: t.trendTvl, stables: t.trendStables }}
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

function Timeline({ lang, compact = false }: { lang: ArbLang; compact?: boolean }) {
  return (
    <ol
      data-testid={compact ? undefined : SEL.arbTimeline}
      className="mt-3 space-y-3 border-s-2 border-hairline ps-4"
    >
      {ARB_TIMELINE.map((e) => (
        <li key={e.date} className="relative">
          <span
            aria-hidden
            className="absolute -start-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--series-1)" }}
          />
          <p className="tabular text-xs text-faint">
            {formatArbDate(e.date, lang)} · {e.category[lang]}
          </p>
          <p className="text-sm font-medium">{e.title[lang]}</p>
          {compact ? null : <p className="text-sm text-ink-2">{e.detail[lang]}</p>}
          <p className="text-[11px] text-faint">
            <SourceLink source={e.source} />
          </p>
        </li>
      ))}
    </ol>
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
        <nav aria-label={t.contents} className="no-print flex flex-wrap gap-1.5 text-xs">
          {[{ id: "guidelines", label: t.guidelines }, { id: "live", label: t.live }, { id: "timeline", label: t.timeline }]
            .concat(ARB_CHAPTERS.map((c) => ({ id: c.id, label: c.title[lang] })))
            .map((l) => (
              <a key={l.id} href={`#${l.id}`} className="rounded-full border border-hairline px-2.5 py-1 text-ink-2 hover:text-ink">
                {l.label}
              </a>
            ))}
        </nav>
      </header>

      <section id="guidelines" data-testid={SEL.arbGuidelines} className="scroll-mt-20">
        <Card>
          <h2 className="text-lg font-semibold">{t.guidelines}</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {ARB_GUIDELINES.map((g) => (
              <div key={g.label.en}>
                <dt className="text-xs font-medium text-faint">{g.label[lang]}</dt>
                <dd className="text-sm">{g.value[lang]}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section data-testid={SEL.arbKeyFacts}>
        <Card>
          <h2 className="text-lg font-semibold">{t.keyFacts}</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARB_KEY_FACTS.map((f) => (
              <div key={f.label.en} className="rounded-lg border border-hairline bg-page px-3 py-2">
                <dt className="text-xs text-faint">{f.label[lang]}</dt>
                <dd className="text-sm font-medium">{f.value[lang]}</dd>
                <dd className="text-[11px] text-faint">
                  <SourceLink source={f.source} />
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section id="live" data-testid={SEL.arbLivePanel} className="scroll-mt-20">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t.live}</h2>
            {liveData?.mode === "fixture" ? <Badge tone="warning">{t.liveFixture}</Badge> : null}
          </div>
          <p data-testid={SEL.arbLiveStatus} data-status={live.status} className="mt-1 text-xs text-faint">
            {live.status === "loading"
              ? t.liveLoading
              : live.status === "error"
                ? t.liveFailed
                : `${t.checked} ${formatArbDateTime(live.data.fetchedAt, lang)}`}
          </p>
          {liveData ? (
            <div className="mt-3 space-y-4">
              <FactTiles
                facts={(["market", "supply", "tvl", "stablecoins", "fees", "github"] as ArbLiveSlot[]).flatMap((s) =>
                  liveFacts(liveData, s, lang),
                )}
              />
              {liveData.competitors?.length ? (
                <div className="overflow-x-auto">
                  <table className="tabular w-full text-sm">
                    <caption className="mb-1 text-start text-sm font-medium text-ink-2">{t.competitors}</caption>
                    <thead>
                      <tr className="text-xs text-faint">
                        <th className="py-1 text-start font-medium">{t.chain}</th>
                        <th className="py-1 text-end font-medium">{t.tvl}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveFacts(liveData, "competitors", lang).map((c) => (
                        <tr key={c.label} className="border-t border-hairline">
                          <td className="py-1">{c.label}</td>
                          <td className="py-1 text-end">{c.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <ArbTrendChart
                data={liveData.trend}
                labels={{ title: t.trend, price: t.trendPrice, tvl: t.trendTvl, stables: t.trendStables }}
              />
            </div>
          ) : null}
        </Card>
      </section>

      <section id="timeline" className="scroll-mt-20">
        <Card>
          <h2 className="text-lg font-semibold">{t.timeline}</h2>
          <Timeline lang={lang} />
        </Card>
      </section>

      {[
        { heading: t.partA, chapters: partA },
        { heading: t.partB, chapters: partB },
      ].map((part) => (
        <div key={part.heading} className="space-y-4">
          <h2 className="text-xl font-bold">{part.heading}</h2>
          {part.chapters.map((c) => (
            <section key={c.id} id={c.id} data-testid={SEL.arbChapter} className="scroll-mt-20 space-y-3">
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
