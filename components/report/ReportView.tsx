"use client";

// The report: one continuous scrollable and printable document. The same
// content serves as the PDF via the print stylesheet.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FanChart } from "@/components/charts/FanChart";
import { PriceChart } from "@/components/charts/PriceChart";
import { QuadrantChart } from "@/components/charts/QuadrantChart";
import {
  Badge,
  GradeChip,
  ScoreBar,
  SectionCard,
  StatTile,
} from "@/components/ui";
import { DEFAULT_WEIGHTS, DISCLAIMER } from "@/lib/constants";
import {
  formatAgo,
  formatCompactUsd,
  formatDate,
  formatMetric,
  formatUsd,
} from "@/lib/format";
import { QUADRANT_LABELS, computeScores } from "@/lib/report/scoring";
import { dcaSchedule } from "@/lib/report/strategy";
import { SEL } from "@/lib/selectors";
import {
  useAssetTiers,
  useRiskProfile,
  useSavedReports,
  useWatchlist,
  useWeights,
} from "@/lib/storage";
import type { Metric, MetricFamily, Report, Trajectory } from "@/lib/types";

const FAMILY_LABELS: Record<MetricFamily, string> = {
  market: "Market",
  supply: "Supply and tokenomics",
  usage: "Usage and fundamentals",
  development: "Development",
  priceBehavior: "Price behavior",
  network: "Network",
};

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function metricsToCsv(metrics: Metric[]): string {
  const header = "family,key,label,value,format,direction,percentile,note";
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
  const rows = metrics.map((m) =>
    [
      m.family,
      m.key,
      esc(m.label),
      m.value ?? "",
      m.format,
      m.direction,
      m.percentile ?? "",
      esc(m.note ?? ""),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function MetricsTable({ metrics }: { metrics: Metric[] }) {
  const families = Array.from(new Set(metrics.map((m) => m.family)));
  return (
    <div className="space-y-6">
      {families.map((fam) => (
        <div key={fam}>
          <h3 className="mb-2 text-sm font-medium text-ink-2">
            {FAMILY_LABELS[fam]}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-faint">
                  <th className="py-1.5 pr-4 font-normal">Metric</th>
                  <th className="py-1.5 pr-4 font-normal">Value</th>
                  <th className="py-1.5 font-normal">Cohort percentile</th>
                </tr>
              </thead>
              <tbody>
                {metrics
                  .filter((m) => m.family === fam)
                  .map((m) => (
                    <tr key={m.key} className="border-b border-hairline/50">
                      <td className="py-2 pr-4">
                        {m.label}
                        {m.note ? (
                          <div className="text-xs text-faint">{m.note}</div>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 tabular">
                        {formatMetric(m.value, m.format)}
                      </td>
                      <td className="w-48 py-2">
                        {m.percentile !== null ? (
                          <ScoreBar value={m.percentile} />
                        ) : (
                          <span className="text-xs text-faint">n/a</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrajectorySection({
  trajectory,
  history,
  title,
}: {
  trajectory: Trajectory;
  history: { t: number; v: number }[];
  title: string;
}) {
  const [horizon, setHorizon] = useState<3 | 6 | 12>(6);
  if (trajectory.insufficientHistory || trajectory.current === null) {
    return (
      <p className="text-sm text-ink-2">
        Insufficient history for the {title} trajectory model. The volatility
        cone requires at least 180 daily observations, and this asset does not
        have them. No score is forced.
      </p>
    );
  }
  const h = trajectory.horizons.find((x) => x.horizonMonths === horizon)!;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {([3, 6, 12] as const).map((m) => (
          <button
            key={m}
            data-testid={`${SEL.trajectoryHorizon}-${m}`}
            onClick={() => setHorizon(m)}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              horizon === m
                ? "border-transparent bg-ink text-page font-medium"
                : "border-hairline text-ink-2 hover:text-ink"
            }`}
          >
            {m} months
          </button>
        ))}
        <span className="ml-auto text-xs text-faint">
          Annualized volatility {((trajectory.annualizedVol ?? 0) * 100).toFixed(0)}%
        </span>
      </div>
      <FanChart
        history={history}
        horizon={h}
        current={trajectory.current}
        unitLabel={title}
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-faint">
              <th className="py-1.5 pr-4 font-normal">Scenario</th>
              <th className="py-1.5 pr-4 font-normal">Probability</th>
              <th className="py-1.5 pr-4 font-normal">Range</th>
              <th className="py-1.5 font-normal">Driver</th>
            </tr>
          </thead>
          <tbody>
            {h.scenarios.map((s) => (
              <tr key={s.key} className="border-b border-hairline/50">
                <td className="py-2 pr-4 capitalize">{s.key}</td>
                <td className="py-2 pr-4 tabular">{s.probability}%</td>
                <td className="py-2 pr-4 tabular">
                  {formatCompactUsd(s.low)} to {formatCompactUsd(s.high)}
                </td>
                <td className="py-2 text-ink-2">{s.narrative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink-2">
        Probability-weighted expected range:{" "}
        <span className="tabular font-medium text-ink">
          {formatCompactUsd(h.expectedLow)} to {formatCompactUsd(h.expectedHigh)}
        </span>
      </p>
      <div className="mt-4">
        <h4 className="text-sm font-medium">Modifiers applied to the volatility cone</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
          {trajectory.modifiers.map((m) => (
            <li key={m.key}>
              <span className="font-medium text-ink">{m.label}</span> ({m.effect}
              ): {m.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ReportView({ report }: { report: Report }) {
  const [weights] = useWeights();
  const [profile] = useRiskProfile();
  const watchlist = useWatchlist();
  const { save } = useSavedReports();
  const [, setTiers] = useAssetTiers();

  const scores = useMemo(
    () =>
      computeScores(
        report.opportunityPillars,
        report.riskPillars,
        weights,
        profile,
      ),
    [report, weights, profile],
  );

  const customWeights =
    JSON.stringify(weights) !== JSON.stringify(DEFAULT_WEIGHTS) ||
    profile !== "balanced";

  // Persist to the saved shelf (for Compare) and record the strategy tier
  // (for Portfolio) whenever a report is viewed.
  useEffect(() => {
    save(report);
    setTiers((prev) => ({ ...prev, [report.asset.id]: report.strategy.tier }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.asset.id, report.generatedAt]);

  const price = report.metrics.find((m) => m.key === "price")?.value ?? null;
  const marketCap = report.metrics.find((m) => m.key === "marketCap")?.value ?? null;
  const isChain = report.asset.type === "chain";
  const dca = dcaSchedule(1000, report.strategy.dcaWeeks);

  return (
    <div className="space-y-6" data-testid={SEL.reportRoot}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" data-testid={SEL.reportTitle}>
              {report.asset.name}
              {report.asset.symbol ? (
                <span className="ml-2 text-lg font-normal text-faint">
                  {report.asset.symbol}
                </span>
              ) : null}
            </h1>
            <Badge tone="neutral">{isChain ? "Chain report" : "Token report"}</Badge>
            {report.dataMode === "fixture" ? (
              <Badge tone="warning" testId={SEL.fixtureBadge}>
                Synthetic fixture data
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-faint">
            Generated {formatAgo(report.generatedAt)} · data tier:{" "}
            {report.reviewTier} ·{" "}
            <Link
              className="underline"
              data-testid={SEL.refreshReport}
              href={`/report/${report.asset.type}/${report.asset.id}?refresh=1`}
            >
              refresh
            </Link>
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            data-testid={SEL.watchlistToggle}
            onClick={() => watchlist.toggle(report.asset)}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-surface"
          >
            {watchlist.has(report.asset) ? "★ Watching" : "☆ Watch"}
          </button>
          <button
            data-testid={SEL.downloadPdf}
            onClick={() => window.print()}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-surface"
          >
            Download PDF
          </button>
          <button
            data-testid={SEL.exportJson}
            onClick={() =>
              downloadBlob(
                `tokenlens-${report.asset.id}.json`,
                JSON.stringify(report, null, 2),
                "application/json",
              )
            }
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-surface"
          >
            Export JSON
          </button>
          <button
            data-testid={SEL.exportCsv}
            onClick={() =>
              downloadBlob(
                `tokenlens-${report.asset.id}-metrics.csv`,
                metricsToCsv(report.metrics),
                "text/csv",
              )
            }
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-surface"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview */}
      <SectionCard
        id="overview"
        title="Overview"
        testId={SEL.sectionOverview}
        subtitle={`Quadrant: ${QUADRANT_LABELS[scores.quadrant]}${customWeights ? " · custom weights and profile applied" : ""}`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Opportunity score"
            value={<span data-testid={SEL.scoreOpportunity}>{scores.opportunity}</span>}
            sub="0 to 100, higher is better"
          />
          <StatTile
            label="Risk score"
            value={<span data-testid={SEL.scoreRisk}>{scores.risk}</span>}
            sub={<GradeChip grade={scores.riskGrade} testId={SEL.riskGrade} />}
          />
          <StatTile
            label="Overall rating"
            value={<span data-testid={SEL.scoreOverall}>{scores.overall}</span>}
            sub={`${profile} profile dampener`}
          />
          <StatTile
            label={isChain ? "Chain TVL" : "Market cap"}
            value={
              isChain
                ? formatCompactUsd(report.network?.tvl ?? null)
                : formatCompactUsd(marketCap)
            }
            sub={price !== null ? `Price ${formatUsd(price)}` : undefined}
          />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-ink-2">
              Risk / opportunity quadrant
            </h3>
            <QuadrantChart
              risk={scores.risk}
              opportunity={scores.opportunity}
              name={report.asset.symbol || report.asset.name}
              cohort={report.cohort}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-ink-2">
              Price history (2y)
            </h3>
            <PriceChart series={report.priceHistory} label="Price" />
            {report.warnings.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-ink-2">
                {report.warnings.map((w) => (
                  <li key={w}>
                    <Badge tone="warning">note</Badge> {w}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {/* Network (chains only) */}
      {isChain && report.network ? (
        <SectionCard
          id="network"
          title="Network"
          testId={SEL.sectionNetwork}
          subtitle="Chain-level TVL, fees, stablecoin float, and ecosystem breadth"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="TVL"
              value={formatCompactUsd(report.network.tvl)}
              sub={
                report.network.tvlChange90dPct !== null
                  ? `${report.network.tvlChange90dPct >= 0 ? "+" : ""}${report.network.tvlChange90dPct.toFixed(1)}% over 90d`
                  : undefined
              }
            />
            <StatTile
              label="Fees (24h)"
              value={formatCompactUsd(report.network.fees24hUsd)}
              sub={`Revenue ${formatCompactUsd(report.network.revenue24hUsd)}`}
            />
            <StatTile
              label="Stablecoin supply"
              value={formatCompactUsd(report.network.stablecoinSupplyUsd)}
            />
            <StatTile
              label="Protocols"
              value={report.network.protocolCount ?? "n/a"}
              sub={
                report.network.topProtocolSharePct !== null
                  ? `Top protocol holds ${report.network.topProtocolSharePct.toFixed(0)}% of TVL`
                  : undefined
              }
            />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-ink-2">TVL history</h3>
              <PriceChart series={report.network.tvlHistory} label="TVL" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-ink-2">
                Top protocols by TVL
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {report.network.topProtocols.map((p) => (
                    <tr key={p.name} className="border-b border-hairline/50">
                      <td className="py-1.5 pr-3">{p.name}</td>
                      <td className="py-1.5 pr-3 text-xs text-faint">{p.category}</td>
                      <td className="py-1.5 text-right tabular">
                        {formatCompactUsd(p.tvl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.asset.coingeckoId ? (
                <p className="mt-3 text-xs text-faint">
                  The token-level sections below analyze the chain&apos;s native
                  asset ({report.asset.symbol}).
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {/* Stats */}
      <SectionCard
        id="stats"
        title="Stats"
        testId={SEL.sectionStats}
        subtitle={`Metric catalog computed at generation time. ${report.cohort.label}.`}
      >
        <MetricsTable metrics={report.metrics} />
      </SectionCard>

      {/* Risk */}
      <SectionCard
        id="risk"
        title="Risk"
        testId={SEL.sectionRisk}
        subtitle="Higher is riskier. The grade always shows its reasons."
      >
        <div className="space-y-3">
          {report.riskPillars.map((p) => (
            <div key={p.key}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-xs text-faint">
                  weight {Math.round((weights.risk[p.key as keyof typeof weights.risk] ?? 0) * 100)}%
                </span>
              </div>
              <ScoreBar value={p.score} invert />
              <ul className="mt-1 text-xs text-ink-2">
                {p.inputs.map((i) => (
                  <li key={i.label}>
                    {i.label}: {i.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {report.riskReasons.length > 0 ? (
          <div className="mt-5 rounded-lg border border-hairline p-3">
            <h3 className="text-sm font-medium">Why this grade</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {report.riskReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </SectionCard>

      {/* Potential */}
      <SectionCard
        id="potential"
        title="Potential"
        testId={SEL.sectionPotential}
        subtitle="Opportunity pillars. Pillars without data are excluded and weights renormalize."
      >
        <div className="space-y-3">
          {report.opportunityPillars.map((p) => (
            <div key={p.key}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-xs text-faint">
                  weight{" "}
                  {Math.round(
                    (weights.opportunity[p.key as keyof typeof weights.opportunity] ?? 0) * 100,
                  )}
                  %
                </span>
              </div>
              <ScoreBar value={p.score} />
              <ul className="mt-1 text-xs text-ink-2">
                {p.inputs.map((i) => (
                  <li key={i.label}>
                    {i.label}: {i.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Trajectory */}
      <SectionCard
        id="trajectory"
        title="Trajectory"
        testId={SEL.sectionTrajectory}
        subtitle="Probability-weighted scenarios from a volatility cone plus visible modifiers. Ranges and drivers, never a price target."
      >
        <TrajectorySection
          trajectory={report.trajectory}
          history={report.priceHistory}
          title="Price"
        />
        {report.tvlTrajectory && !report.tvlTrajectory.insufficientHistory ? (
          <div className="mt-8 border-t border-hairline pt-6">
            <h3 className="mb-3 text-base font-semibold">TVL growth trajectory</h3>
            <p className="mb-3 text-sm text-ink-2">
              Same engine applied to trailing TVL instead of price. Network
              health and token price can diverge for a while.
            </p>
            <TrajectorySection
              trajectory={report.tvlTrajectory}
              history={report.network?.tvlHistory ?? []}
              title="TVL"
            />
          </div>
        ) : null}
        <p className="mt-6 text-xs text-faint">
          Calibration logging (did price land in the predicted range) is part of
          the design but not wired in this build. {DISCLAIMER}
        </p>
      </SectionCard>

      {/* News and events */}
      <SectionCard
        id="events"
        title="News and events"
        testId={SEL.sectionEvents}
        subtitle="Decision calendar: dated, resolvable events only"
      >
        {report.events.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-faint">
                <th className="py-1.5 pr-4 font-normal">Date</th>
                <th className="py-1.5 pr-4 font-normal">Event</th>
                <th className="py-1.5 pr-4 font-normal">Type</th>
                <th className="py-1.5 pr-4 font-normal">Impact</th>
                <th className="py-1.5 font-normal">Scope</th>
              </tr>
            </thead>
            <tbody>
              {report.events.map((e) => (
                <tr key={`${e.date}-${e.title}`} className="border-b border-hairline/50">
                  <td className="py-2 pr-4 tabular">{formatDate(e.date)}</td>
                  <td className="py-2 pr-4">
                    {e.title}
                    {e.note ? <div className="text-xs text-faint">{e.note}</div> : null}
                  </td>
                  <td className="py-2 pr-4 capitalize">{e.type}</td>
                  <td className="py-2 pr-4">
                    <Badge
                      tone={
                        e.impact === "high"
                          ? "critical"
                          : e.impact === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {e.impact}
                    </Badge>
                  </td>
                  <td className="py-2 capitalize">{e.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink-2">
            No dated events inside the next 12 months.
          </p>
        )}
        <p className="mt-4 text-xs text-faint">
          This build wires the macro calendar (FOMC). News signals, governance
          votes, unlock schedules, and regulatory feeds are designed but not yet
          wired; the narrative pillar is excluded from scoring until they are.
        </p>
      </SectionCard>

      {/* Strategy */}
      <SectionCard
        id="strategy"
        title="Strategy"
        testId={SEL.sectionStrategy}
        subtitle="A disciplined way to hold it, if you choose to"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={report.strategy.tier === "avoid" ? "critical" : "accent"}>
            {report.strategy.tierLabel}
          </Badge>
          <span className="text-sm text-ink-2">{report.strategy.rationale}</span>
        </div>
        {report.strategy.tier !== "avoid" ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">
                Entry: DCA over {report.strategy.dcaWeeks} weeks
              </h3>
              <p className="mt-1 text-xs text-ink-2">{report.strategy.dcaNote}</p>
              <p className="mt-2 text-xs text-faint">
                Illustrative schedule for $1,000 (scale to your amount):
              </p>
              <table className="mt-1 w-full max-w-xs text-sm">
                <tbody>
                  {dca.slice(0, 4).map((d) => (
                    <tr key={d.week} className="border-b border-hairline/50">
                      <td className="py-1 pr-3 text-xs text-faint">Week {d.week}</td>
                      <td className="py-1 pr-3 tabular">{formatDate(d.dateIso)}</td>
                      <td className="py-1 text-right tabular">
                        {formatUsd(d.amountUsd, 2)}
                      </td>
                    </tr>
                  ))}
                  {dca.length > 4 ? (
                    <tr>
                      <td colSpan={3} className="py-1 text-xs text-faint">
                        plus {dca.length - 4} more weekly installments
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-ink-2">
                Position cap: at most {report.strategy.maxPositionPct}% of the
                portfolio for this tier.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Exit ladder (editable defaults)</h3>
              <ul className="mt-1 space-y-1 text-sm text-ink-2">
                {report.strategy.exitLadder.map((r) => (
                  <li key={r.trigger}>
                    {r.trigger}: <span className="text-ink">{r.action}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 text-sm font-medium">Review triggers, not stops</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-2">
                {report.strategy.reviewTriggers.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-2">
            No allocation template applies. Track it on the watchlist and
            re-check after the next refresh if the picture changes.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
