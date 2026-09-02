"use client";

// Settings and methodology controls: pillar weight editor with live
// re-scoring against the most recently viewed report, risk profile selection,
// and a data-freshness view over the saved shelf.

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, SectionCard } from "@/components/ui";
import {
  DEFAULT_WEIGHTS,
  OPPORTUNITY_PILLAR_LABELS,
  RISK_PILLAR_LABELS,
} from "@/lib/constants";
import { formatAgo } from "@/lib/format";
import { buildDataExport, eraseAllData } from "@/lib/privacy";
import { computeScores } from "@/lib/report/scoring";
import { SEL } from "@/lib/selectors";
import {
  usePersonalToken,
  useRiskProfile,
  useSavedReports,
  useWeights,
} from "@/lib/storage";
import type { RiskProfile, WeightSet } from "@/lib/types";

function WeightRow({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <label className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="w-full sm:w-56 sm:shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={50}
        step={5}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        data-testid={testId}
        className="flex-1 accent-[var(--series-1)]"
      />
      <span className="w-10 text-right tabular text-ink-2">
        {Math.round(value * 100)}%
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const [weights, setWeights] = useWeights();
  const [profile, setProfile] = useRiskProfile();
  const [personalToken, setPersonalToken] = usePersonalToken();
  const { saved } = useSavedReports();
  const [eraseStatus, setEraseStatus] = useState<string | null>(null);

  const exportData = () => {
    const doc = buildDataExport(window.localStorage);
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokenlens-data-${doc.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const eraseData = async () => {
    const ok = window.confirm(
      "Erase all TokenLens data from this browser" +
        (personalToken ? " and the synced server copy" : "") +
        "? This cannot be undone.",
    );
    if (!ok) return;
    const result = await eraseAllData({
      local: window.localStorage,
      session: window.sessionStorage,
      fetchImpl: fetch,
      cachesImpl: typeof caches === "undefined" ? undefined : caches,
    });
    setEraseStatus(
      result.server === "failed"
        ? "Local data erased. The server copy could not be cleared (network or token problem); retry with a working connection."
        : result.server === "cleared"
          ? "All local data and the synced server copy were erased."
          : "All local data was erased.",
    );
  };

  const previewReport = saved[0]?.report ?? null;
  const previewScores = useMemo(() => {
    if (!previewReport) return null;
    return computeScores(
      previewReport.opportunityPillars,
      previewReport.riskPillars,
      weights,
      profile,
    );
  }, [previewReport, weights, profile]);

  const setOpp = (key: keyof WeightSet["opportunity"], v: number) =>
    setWeights((w) => ({ ...w, opportunity: { ...w.opportunity, [key]: v } }));
  const setRisk = (key: keyof WeightSet["risk"], v: number) =>
    setWeights((w) => ({ ...w, risk: { ...w.risk, [key]: v } }));

  const oppSum = Object.values(weights.opportunity).reduce((a, b) => a + b, 0);
  const riskSum = Object.values(weights.risk).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings and methodology</h1>

      <SectionCard
        id="profile"
        title="Risk profile"
        subtitle="Sets the overall-score dampener and the allocation template"
      >
        <div className="flex gap-2">
          {(["conservative", "balanced", "aggressive"] as RiskProfile[]).map((p) => (
            <button
              key={p}
              data-testid={`${SEL.riskProfileSelect}-${p}`}
              onClick={() => setProfile(p)}
              className={`rounded-md border px-3 py-1.5 text-sm capitalize ${
                profile === p
                  ? "border-transparent bg-ink text-page font-medium"
                  : "border-hairline text-ink-2 hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        id="weights"
        title="Pillar weights"
        subtitle="Disagree with the defaults? Change them. Weights renormalize, so proportions are what matter."
        testId={SEL.weightsEditor}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium">
              Opportunity pillars{" "}
              <span className="text-xs text-faint">(sum {Math.round(oppSum * 100)}%)</span>
            </h3>
            <div className="space-y-2.5">
              {(
                Object.keys(weights.opportunity) as (keyof WeightSet["opportunity"])[]
              ).map((k) => (
                <WeightRow
                  key={k}
                  label={OPPORTUNITY_PILLAR_LABELS[k]}
                  value={weights.opportunity[k]}
                  onChange={(v) => setOpp(k, v)}
                  testId={`${SEL.weightSlider}-opp-${k}`}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">
              Risk pillars{" "}
              <span className="text-xs text-faint">(sum {Math.round(riskSum * 100)}%)</span>
            </h3>
            <div className="space-y-2.5">
              {(Object.keys(weights.risk) as (keyof WeightSet["risk"])[]).map((k) => (
                <WeightRow
                  key={k}
                  label={RISK_PILLAR_LABELS[k]}
                  value={weights.risk[k]}
                  onChange={(v) => setRisk(k, v)}
                  testId={`${SEL.weightSlider}-risk-${k}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            data-testid={SEL.weightsReset}
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-page"
          >
            Reset to defaults
          </button>
          {previewReport && previewScores ? (
            <span className="text-sm text-ink-2">
              Live preview against{" "}
              <span className="font-medium text-ink">
                {previewReport.asset.name}
              </span>
              : opportunity {previewScores.opportunity}, risk {previewScores.risk},
              overall {previewScores.overall} (grade {previewScores.riskGrade})
            </span>
          ) : (
            <span className="text-sm text-faint">
              Open any report once to get a live re-scoring preview here.
            </span>
          )}
        </div>
      </SectionCard>

      <SectionCard
        id="personal-sync"
        title="Personal sync"
        subtitle="Share watchlist and portfolio with the MCP connector"
      >
        <p className="text-sm text-ink-2">
          Paste the deployment&apos;s personal token to mirror your watchlist,
          positions, and asset tiers to the server. Claude can then read and
          update them through the MCP personal tools, and changes flow back to
          this browser. Leave empty to keep everything local to this device.
        </p>
        <label className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="w-full sm:w-56 sm:shrink-0">Personal token</span>
          <input
            type="password"
            value={personalToken}
            onChange={(e) => setPersonalToken(e.target.value.trim())}
            placeholder="Not configured"
            autoComplete="off"
            data-testid={SEL.personalTokenInput}
            className="min-w-0 flex-1 rounded border border-hairline bg-transparent px-2 py-1.5"
          />
        </label>
      </SectionCard>

      <SectionCard
        id="freshness"
        title="Data freshness"
        subtitle="Recently generated reports on this device"
      >
        {saved.length === 0 ? (
          <p className="text-sm text-faint">No reports generated yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {saved.map((s) => (
              <li key={`${s.report.asset.type}:${s.report.asset.id}`}>
                <Link
                  className="underline"
                  href={`/report/${s.report.asset.type}/${encodeURIComponent(s.report.asset.id)}`}
                >
                  {s.report.asset.name}
                </Link>{" "}
                <span className="text-faint">
                  generated {formatAgo(s.report.generatedAt)}
                  {s.report.dataMode === "fixture" ? " · fixture data" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        id="your-data"
        title="Your data"
        subtitle="Export or erase everything this site holds about you"
      >
        <p className="text-sm text-ink-2">
          Everything TokenLens keeps about you lives in this browser: watchlist,
          positions, tiers, weights, risk profile, saved reports, and your
          cookie consent choice. Export it as a JSON file (data portability)
          or erase it all (right to erasure). Erasing also clears the synced
          server copy when a personal token is set, and empties the offline
          cache. Details are in the{" "}
          <Link href="/privacy" className="underline">
            privacy notice
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-testid={SEL.privacyExport}
            onClick={exportData}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm hover:bg-page"
          >
            Export my data (JSON)
          </button>
          <button
            type="button"
            data-testid={SEL.privacyErase}
            onClick={eraseData}
            className="rounded-md border border-critical px-3 py-1.5 text-sm text-critical hover:bg-page"
          >
            Erase all my data
          </button>
        </div>
        {eraseStatus ? (
          <p
            role="status"
            data-testid={SEL.privacyEraseStatus}
            className="mt-3 text-sm text-ink-2"
          >
            {eraseStatus}
          </p>
        ) : null}
      </SectionCard>

      <Card>
        <p className="text-sm text-ink-2">
          The app should be able to explain itself: read the full{" "}
          <Link href="/methodology" className="underline">
            methodology page
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
