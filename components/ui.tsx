import type { ReactNode } from "react";
import type { RiskGrade } from "@/lib/types";

export function Card({
  children,
  className = "",
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={`print-card rounded-xl border border-hairline bg-surface p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  id,
  title,
  subtitle,
  children,
  testId,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section id={id} data-testid={testId} className="scroll-mt-20">
      <Card>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p> : null}
        <div className="mt-4">{children}</div>
      </Card>
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
  testId,
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warning" | "serious" | "critical" | "accent";
  testId?: string;
}) {
  const styles: Record<string, string> = {
    neutral: "border-hairline text-ink-2",
    good: "border-transparent text-white",
    warning: "border-transparent text-black",
    serious: "border-transparent text-black",
    critical: "border-transparent text-white",
    accent: "border-transparent text-white",
  };
  const bg: Record<string, string | undefined> = {
    good: "var(--status-good)",
    warning: "var(--status-warning)",
    serious: "var(--status-serious)",
    critical: "var(--status-critical)",
    accent: "var(--series-1)",
  };
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[tone]}`}
      style={bg[tone] ? { background: bg[tone] } : undefined}
    >
      {children}
    </span>
  );
}

export const GRADE_TONES: Record<RiskGrade, "good" | "warning" | "serious" | "critical"> = {
  A: "good",
  B: "good",
  C: "warning",
  D: "serious",
  E: "critical",
};

export function GradeChip({ grade, testId }: { grade: RiskGrade; testId?: string }) {
  return (
    <Badge tone={GRADE_TONES[grade]} testId={testId}>
      <span aria-hidden>&#9679;</span> Risk grade {grade}
    </Badge>
  );
}

export function StatTile({
  label,
  value,
  sub,
  testId,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  testId?: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-3" data-testid={testId}>
      <div className="text-xs text-faint">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-ink-2">{sub}</div> : null}
    </div>
  );
}

/** Horizontal 0-100 score bar. Single-hue sequential fill per the viz method. */
export function ScoreBar({
  value,
  invert = false,
}: {
  value: number | null;
  /** When true, high values render in the critical hue (risk bars). */
  invert?: boolean;
}) {
  if (value === null) {
    return <div className="text-xs text-faint">no data</div>;
  }
  const fill = invert
    ? value >= 60
      ? "var(--status-critical)"
      : value >= 40
        ? "var(--status-serious)"
        : "var(--status-good)"
    : "var(--seq-450)";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full"
        style={{ background: "var(--grid)" }}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: fill }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular text-ink-2">
        {Math.round(value)}
      </span>
    </div>
  );
}

export function Delta({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="text-faint">n/a</span>;
  }
  const up = value >= 0;
  return (
    <span className="tabular" style={{ color: up ? "var(--delta-up)" : "var(--delta-down)" }}>
      {up ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}
