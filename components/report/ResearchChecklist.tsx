"use client";

// The guided fundamental research checklist rendered inside a report. Auto
// items pre-fill from the report's own metrics with a labeled basis; every
// other item takes a manual 1-5 score and a note. Answers persist locally per
// asset, like the watchlist.

import { useCallback, useMemo } from "react";
import { Badge, SectionCard } from "@/components/ui";
import { buildAutoAnswers } from "@/lib/research/autofill";
import {
  CHECKLIST,
  GATE_LABELS,
  STAGE_LABELS,
  type AutoAnswer,
  type ChecklistItem,
  type ChecklistScore,
  type ChecklistStage,
  type ResearchAnswer,
  researchKey,
  summarizeChecklist,
} from "@/lib/research/checklist";
import { SEL } from "@/lib/selectors";
import { useResearchRecords } from "@/lib/storage";
import type { Report } from "@/lib/types";

const SCORES: ChecklistScore[] = [1, 2, 3, 4, 5];

function ScorePicker({
  itemKey,
  answer,
  auto,
  onScore,
}: {
  itemKey: string;
  answer: ResearchAnswer | undefined;
  auto: AutoAnswer | undefined;
  onScore: (score: ChecklistScore | undefined) => void;
}) {
  const manual = answer?.score;
  const suggested = auto?.suggested ?? null;
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Score for ${itemKey}`}>
      {SCORES.map((s) => {
        const isManual = manual === s;
        const isSuggested = manual === undefined && suggested === s;
        return (
          <button
            key={s}
            data-testid={`${SEL.researchScore}-${itemKey}-${s}`}
            aria-pressed={isManual}
            title={isSuggested ? "Suggested from report data. Click to confirm or pick another." : undefined}
            onClick={() => onScore(isManual ? undefined : s)}
            className={`h-7 w-7 rounded-md border text-xs tabular ${
              isManual
                ? "border-transparent bg-ink font-medium text-page"
                : isSuggested
                  ? "border-ink/60 border-dashed text-ink"
                  : "border-hairline text-ink-2 hover:text-ink"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function ItemRow({
  item,
  answer,
  auto,
  onChange,
}: {
  item: ChecklistItem;
  answer: ResearchAnswer | undefined;
  auto: AutoAnswer | undefined;
  onChange: (next: ResearchAnswer) => void;
}) {
  return (
    <div
      data-testid={`${SEL.researchItem}-${item.key}`}
      className="flex flex-col gap-2 border-b border-hairline/50 py-2.5 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0 sm:max-w-[55%]">
        <div className="text-sm">{item.label}</div>
        {item.hint ? <div className="mt-0.5 text-xs text-faint">{item.hint}</div> : null}
        {auto ? (
          <div
            className="mt-1 text-xs text-ink-2"
            data-testid={`${SEL.researchAuto}-${item.key}`}
          >
            <Badge tone="neutral">auto</Badge>{" "}
            <span className="font-medium text-ink">{auto.display}</span>
            <span className="text-faint"> · {auto.basis}</span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
        <ScorePicker
          itemKey={item.key}
          answer={answer}
          auto={auto}
          onScore={(score) => onChange({ ...answer, score })}
        />
        <input
          data-testid={`${SEL.researchNote}-${item.key}`}
          value={answer?.note ?? ""}
          onChange={(e) => onChange({ ...answer, note: e.target.value })}
          placeholder="Notes"
          className="no-print w-full rounded-md border border-hairline bg-transparent px-2 py-1 text-xs sm:w-44"
        />
        {answer?.note ? (
          <span className="print-only text-xs text-ink-2">{answer.note}</span>
        ) : null}
      </div>
    </div>
  );
}

export function ResearchChecklist({ report }: { report: Report }) {
  const [records, setRecords] = useResearchRecords();
  const key = researchKey(report.asset.type, report.asset.id);
  const answers = useMemo(() => records[key]?.answers ?? {}, [records, key]);
  const autoAnswers = useMemo(() => buildAutoAnswers(report), [report]);
  const summary = useMemo(
    () => summarizeChecklist(answers, autoAnswers),
    [answers, autoAnswers],
  );

  const updateAnswer = useCallback(
    (itemKey: string, next: ResearchAnswer) => {
      setRecords((prev) => {
        const current = prev[key]?.answers ?? {};
        const cleaned: ResearchAnswer = {
          ...(next.score ? { score: next.score } : {}),
          ...(next.note ? { note: next.note } : {}),
        };
        const merged = { ...current };
        if (cleaned.score || cleaned.note) merged[itemKey] = cleaned;
        else delete merged[itemKey];
        return {
          ...prev,
          [key]: { updatedAt: new Date().toISOString(), answers: merged },
        };
      });
    },
    [key, setRecords],
  );

  const stages: ChecklistStage[] = [1, 2];

  return (
    <SectionCard
      id="research"
      title="Research checklist"
      testId={SEL.sectionResearch}
      subtitle="Guided fundamental research, adapted from the BDCC coin analysis checklist. Auto rows come from this report's data; everything else is your own judgment, scored 1 to 5. Answers stay in this browser."
    >
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-hairline p-3 text-sm">
        <div>
          <span className="text-xs text-faint">Overall</span>{" "}
          <span className="tabular font-semibold" data-testid={SEL.researchOverall}>
            {summary.overall !== null ? `${summary.overall} / 5` : "n/a"}
          </span>
        </div>
        <div>
          <span className="text-xs text-faint">Answered</span>{" "}
          <span className="tabular" data-testid={SEL.researchCompletion}>
            {summary.answered} / {summary.total}
          </span>
        </div>
        <div data-testid={SEL.researchGate}>
          <Badge
            tone={
              summary.gate === "proceed"
                ? "good"
                : summary.gate === "stop"
                  ? "warning"
                  : "neutral"
            }
          >
            {summary.gate === "insufficient"
              ? "gate locked"
              : summary.gate === "proceed"
                ? "continue research"
                : "stop here"}
          </Badge>{" "}
          <span className="text-xs text-ink-2">
            {GATE_LABELS[summary.gate]}
            {summary.stage1Score !== null ? ` (stage 1 average ${summary.stage1Score})` : ""}
          </span>
        </div>
      </div>

      {stages.map((stage) => (
        <div key={stage} className="mt-4 first:mt-0">
          <h3 className="mb-1 text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
          <div className="space-y-2">
            {CHECKLIST.filter((s) => s.stage === stage).map((section) => {
              const sectionSummary = summary.sections.find((s) => s.key === section.key);
              return (
                <details
                  key={section.key}
                  data-testid={`${SEL.researchSection}-${section.key}`}
                  className="rounded-lg border border-hairline px-3 py-2"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{section.label}</span>
                    <span className="text-xs text-faint">
                      {sectionSummary?.score !== null && sectionSummary
                        ? `${sectionSummary.score} / 5 · `
                        : ""}
                      {sectionSummary?.answered} of {sectionSummary?.total} scored
                    </span>
                  </summary>
                  <div className="mt-1">
                    {section.items.map((item) => (
                      <ItemRow
                        key={item.key}
                        item={item}
                        answer={answers[item.key]}
                        auto={autoAnswers[item.key]}
                        onChange={(next) => updateAnswer(item.key, next)}
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-4 text-xs text-faint">
        Stage 3 is the summary strip above: section averages roll up into one
        1 to 5 verdict, and the stage 1 gate tells you whether deep research is
        justified. Manual scores always override auto suggestions.
      </p>
    </SectionCard>
  );
}
