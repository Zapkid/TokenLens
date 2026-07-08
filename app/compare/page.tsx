"use client";

// Compare page: pick 2 to 4 previously saved reports and see them side by
// side, pillar scores recomputed live against the user's weights and risk
// profile. Reports land on the shelf automatically the first time they are
// viewed (see lib/storage.ts useSavedReports).

import { useEffect, useMemo, useState } from "react";
import { RadarCompare } from "@/components/charts/RadarCompare";
import { Card, GradeChip } from "@/components/ui";
import { OPPORTUNITY_PILLAR_LABELS, RISK_PILLAR_LABELS } from "@/lib/constants";
import { buildRadarData, marketCapOf, reportSeriesId, rescoreAll } from "@/lib/compare";
import { formatCompactUsd } from "@/lib/format";
import { QUADRANT_LABELS } from "@/lib/report/scoring";
import { SEL } from "@/lib/selectors";
import { useRiskProfile, useSavedReports, useWeights } from "@/lib/storage";
import type { OpportunityPillarKey, RiskPillarKey } from "@/lib/types";

const MAX_SELECTED = 4;
const MIN_SELECTED = 2;

const OPPORTUNITY_KEYS = Object.keys(OPPORTUNITY_PILLAR_LABELS) as OpportunityPillarKey[];
const RISK_KEYS = Object.keys(RISK_PILLAR_LABELS) as RiskPillarKey[];

export default function ComparePage() {
  const { saved } = useSavedReports();
  const [weights] = useWeights();
  const [profile] = useRiskProfile();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (selectedIds.length === 0 && saved.length > 0) {
      setSelectedIds(saved.slice(0, MAX_SELECTED).map((s) => reportSeriesId(s.report)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.length]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  const selectedReports = useMemo(
    () =>
      saved.filter((s) => selectedIds.includes(reportSeriesId(s.report))).map((s) => s.report),
    [saved, selectedIds],
  );

  const rescored = useMemo(
    () => rescoreAll(selectedReports, weights, profile),
    [selectedReports, weights, profile],
  );

  const radarData = useMemo(() => buildRadarData(selectedReports), [selectedReports]);

  if (saved.length < MIN_SELECTED) {
    return (
      <div data-testid={SEL.compareRoot} className="space-y-6">
        <h1 className="text-2xl font-bold">Compare</h1>
        <Card>
          <p className="text-sm text-ink-2">
            Compare needs at least two saved reports. Open a token or chain
            report first, from Library or Search: reports are saved to this
            shelf automatically when viewed. Then come back here to compare
            them side by side.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid={SEL.compareRoot} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compare</h1>
        <p className="mt-1 text-sm text-ink-2">
          Pick 2 to 4 saved reports. Scores recompute live against the pillar
          weights and risk profile set on the Settings page.
        </p>
      </div>

      <Card>
        <div data-testid={SEL.comparePicker} className="flex flex-wrap gap-2">
          {saved.map((s) => {
            const id = reportSeriesId(s.report);
            const checked = selectedIds.includes(id);
            const disabled = !checked && selectedIds.length >= MAX_SELECTED;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  checked
                    ? "border-transparent bg-ink text-page"
                    : "border-hairline text-ink-2 hover:text-ink"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(id)}
                />
                {s.report.asset.name} ({s.report.asset.symbol.toUpperCase()})
              </label>
            );
          })}
        </div>
        {selectedIds.length >= MAX_SELECTED ? (
          <p className="mt-2 text-xs text-faint">
            Maximum of {MAX_SELECTED} reports. Unselect one to swap it out.
          </p>
        ) : null}
      </Card>

      {selectedReports.length < MIN_SELECTED ? (
        <Card>
          <p className="text-sm text-ink-2">
            Select at least {MIN_SELECTED} reports above to compare.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <RadarCompare data={radarData} />
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-hairline px-2 py-2 text-left text-xs font-medium text-faint">
                    Report
                  </th>
                  {rescored.map(({ report }) => (
                    <th
                      key={reportSeriesId(report)}
                      className="border-b border-hairline px-2 py-2 text-left"
                    >
                      <div className="font-medium">{report.asset.name}</div>
                      <div className="text-xs text-faint">
                        {report.asset.symbol.toUpperCase()} · {report.asset.type}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1.5 text-ink-2">Opportunity</td>
                  {rescored.map(({ report, scores }) => (
                    <td key={reportSeriesId(report)} className="tabular px-2 py-1.5">
                      {scores.opportunity}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-1.5 text-ink-2">Risk</td>
                  {rescored.map(({ report, scores }) => (
                    <td key={reportSeriesId(report)} className="px-2 py-1.5">
                      <span className="tabular">{scores.risk}</span>{" "}
                      <GradeChip grade={scores.riskGrade} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-1.5 text-ink-2">Overall</td>
                  {rescored.map(({ report, scores }) => (
                    <td key={reportSeriesId(report)} className="tabular px-2 py-1.5 font-medium">
                      {scores.overall}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-1.5 text-ink-2">Quadrant</td>
                  {rescored.map(({ report, scores }) => (
                    <td key={reportSeriesId(report)} className="px-2 py-1.5">
                      {QUADRANT_LABELS[scores.quadrant]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-1.5 text-ink-2">Market cap</td>
                  {rescored.map(({ report }) => (
                    <td key={reportSeriesId(report)} className="tabular px-2 py-1.5">
                      {formatCompactUsd(marketCapOf(report))}
                    </td>
                  ))}
                </tr>
                {OPPORTUNITY_KEYS.map((key) => (
                  <tr key={key}>
                    <td className="px-2 py-1.5 text-ink-2">{OPPORTUNITY_PILLAR_LABELS[key]}</td>
                    {rescored.map(({ report }) => {
                      const score =
                        report.opportunityPillars.find((p) => p.key === key)?.score ?? null;
                      return (
                        <td key={reportSeriesId(report)} className="tabular px-2 py-1.5">
                          {score === null ? "no data" : Math.round(score)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {RISK_KEYS.map((key) => (
                  <tr key={key}>
                    <td className="px-2 py-1.5 text-ink-2">{RISK_PILLAR_LABELS[key]}</td>
                    {rescored.map(({ report }) => {
                      const score = report.riskPillars.find((p) => p.key === key)?.score ?? null;
                      return (
                        <td key={reportSeriesId(report)} className="tabular px-2 py-1.5">
                          {score === null ? "no data" : Math.round(score)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
