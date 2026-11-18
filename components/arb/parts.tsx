import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { arbStrings, formatArbDate } from "@/lib/arb/i18n";
import type { ArbLiveFact } from "@/lib/arb/live-format";
import type { ArbCheckStatus } from "@/lib/arb/verify";
import type { ArbLang, ArbSource, ArbVerification } from "@/lib/arb/types";
import { SEL } from "@/lib/selectors";

// Shared building blocks for the /arb sections: a section frame that marks
// what kind of data it holds, source links, fact tiles, and status badges.

export type ArbSectionKind = "course" | "static" | "live" | "learn" | "personal" | "answers";

/** Accent per section kind, from the validated chart palette. */
export const KIND_COLOR: Record<ArbSectionKind, string> = {
  course: "var(--muted)",
  static: "var(--series-5)",
  live: "var(--series-2)",
  learn: "var(--series-3)",
  personal: "var(--series-6)",
  answers: "var(--series-1)",
};

export function kindName(kind: ArbSectionKind, lang: ArbLang): string {
  const t = arbStrings(lang);
  return {
    course: t.kindCourse,
    static: t.kindStatic,
    live: t.kindLive,
    learn: t.kindLearn,
    personal: t.kindPersonal,
    answers: t.answers,
  }[kind];
}

export function KindTag({ kind, lang, note }: { kind: ArbSectionKind; lang: ArbLang; note?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-2">
      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_COLOR[kind] }} />
      {kindName(kind, lang)}
      {note ? <span className="font-normal normal-case tracking-normal text-faint">· {note}</span> : null}
    </span>
  );
}

export function Section({
  id,
  kind,
  lang,
  title,
  intro,
  note,
  testId,
  children,
}: {
  id: string;
  kind: ArbSectionKind;
  lang: ArbLang;
  title: string;
  intro?: string;
  note?: string;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-testid={testId} data-kind={kind} className="scroll-mt-20">
      <div
        className="print-card rounded-xl border border-s-4 border-hairline bg-surface p-4 shadow-sm"
        style={{ borderInlineStartColor: KIND_COLOR[kind] }}
      >
        <KindTag kind={kind} lang={lang} note={note} />
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {intro ? <p className="mt-1 max-w-3xl text-sm text-ink-2">{intro}</p> : null}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

export function SourceLink({ source }: { source: ArbSource }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
      {source.label}
    </a>
  );
}

export function FactTiles({ facts }: { facts: ArbLiveFact[] }) {
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

const STATUS_TONE: Record<ArbCheckStatus, "good" | "warning" | "critical" | "neutral"> = {
  pass: "good",
  warn: "warning",
  fail: "critical",
  skip: "neutral",
};

export function CheckBadge({ status, lang }: { status: ArbCheckStatus; lang: ArbLang }) {
  const t = arbStrings(lang);
  const label = { pass: t.statusPass, warn: t.statusWarn, fail: t.statusFail, skip: t.statusSkip }[status];
  return <Badge tone={STATUS_TONE[status]}>{label}</Badge>;
}

export function VerificationBadge({ v, lang }: { v: ArbVerification; lang: ArbLang }) {
  const t = arbStrings(lang);
  const label = {
    primary: t.verifiedPrimary,
    secondary: t.verifiedSecondary,
    derived: t.verifiedDerived,
    conflicting: t.verifiedConflicting,
  }[v.status];
  const tone = v.status === "primary" ? "good" : v.status === "conflicting" ? "warning" : "neutral";
  const title = `${label}, ${formatArbDate(v.checkedOn, lang)}${v.note ? `: ${v.note[lang]}` : ""}`;
  return (
    <span title={title} data-verification={v.status}>
      <Badge tone={tone}>{label}</Badge>
    </span>
  );
}
