"use client";

import { Badge } from "@/components/ui";
import { ARB_HISTORY, historyDateLabel } from "@/lib/arb/content";
import { arbStrings, formatArbDateTime } from "@/lib/arb/i18n";
import type { ArbLive } from "@/lib/arb/live";
import { liveFacts } from "@/lib/arb/live-format";
import type { ArbLang, ArbLiveSlot } from "@/lib/arb/types";
import { summarizeChecks, verifyArbLive } from "@/lib/arb/verify";
import { formatCompactUsd } from "@/lib/format";
import { SEL } from "@/lib/selectors";
import { ArbTrendChart, type ArbChartMarker } from "../ArbTrendChart";
import { CheckBadge, FactTiles, Section, SourceLink } from "../parts";
import { SRC } from "@/lib/arb/sources";

export type LiveState = { status: "loading" } | { status: "error" } | { status: "ready"; data: ArbLive };

/** History events as chart markers, numbered in date order. */
export function chartMarkers(lang: ArbLang): ArbChartMarker[] {
  // Month-precision events are placed mid-month; year-only events are skipped.
  return ARB_HISTORY.filter((e) => e.date.length >= 7).map((e, i) => ({
    t: Date.parse(`${e.date.length === 7 ? `${e.date}-15` : e.date}T00:00:00Z`),
    n: i + 1,
    label: `${historyDateLabel(e.date, lang)}: ${e.title[lang]}`,
  }));
}

const GROUPS: { title: { en: string; he: string }; slots: ArbLiveSlot[] }[] = [
  { title: { en: "Token and market", he: "טוקן ושוק" }, slots: ["market", "supply"] },
  { title: { en: "Usage and money on the chain", he: "שימוש וכסף ברשת" }, slots: ["tvl", "stablecoins", "fees"] },
  { title: { en: "Security and value secured", he: "אבטחה וערך מאובטח" }, slots: ["l2beat"] },
  { title: { en: "Development", he: "פיתוח" }, slots: ["github"] },
];

export function LiveSection({ live, lang }: { live: LiveState; lang: ArbLang }) {
  const t = arbStrings(lang);
  const data = live.status === "ready" ? live.data : null;
  const checks = verifyArbLive(data, data ? Date.now() : undefined);
  const counts = summarizeChecks(checks);
  const arbL2 = data?.l2beat?.find((p) => p.slug === "arbitrum");

  return (
    <Section
      id="live"
      kind="live"
      lang={lang}
      title={t.live}
      testId={SEL.arbLivePanel}
      note={data ? `${t.checked} ${formatArbDateTime(data.fetchedAt, lang)}` : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p data-testid={SEL.arbLiveStatus} data-status={live.status} className="text-xs text-faint">
          {live.status === "loading" ? t.liveLoading : live.status === "error" ? t.liveFailed : null}
        </p>
        {data?.mode === "fixture" ? <Badge tone="warning">{t.liveFixture}</Badge> : null}
      </div>

      {data ? (
        <div className="space-y-6">
          {GROUPS.map((g) => {
            const facts = g.slots.flatMap((s) => liveFacts(data, s, lang)).filter(
              // Other chains' stages are shown in the comparison table instead.
              (f) => !(g.slots.includes("l2beat") && f.label.includes(":")),
            );
            if (!facts.length) return null;
            return (
              <div key={g.title.en}>
                <h3 className="mb-2 text-sm font-semibold">{g.title[lang]}</h3>
                <FactTiles facts={facts} />
              </div>
            );
          })}

          {data.chains?.length || data.l2beat?.length ? (
            <div className="overflow-x-auto">
              <table data-testid={SEL.arbChainsTable} className="tabular w-full min-w-[28rem] text-sm">
                <caption className="mb-1 text-start text-sm font-semibold">{t.competitors}</caption>
                <thead>
                  <tr className="text-xs text-faint">
                    <th className="py-1 text-start font-medium">{t.chain}</th>
                    <th className="py-1 text-start font-medium">{t.group}</th>
                    <th className="py-1 text-start font-medium">{t.stage}</th>
                    <th className="py-1 text-end font-medium">{t.tvs}</th>
                    <th className="py-1 text-end font-medium">{t.tvlShort}</th>
                  </tr>
                </thead>
                <tbody>
                  {chainRows(data).map((r) => (
                    <tr key={r.name} className="border-t border-hairline">
                      <td className="py-1">{r.name}</td>
                      <td className="py-1 text-ink-2">{r.group === "arbitrum" ? t.groupArbitrum : t.groupCompetitor}</td>
                      <td className="py-1">{r.stage ?? t.na}</td>
                      <td className="py-1 text-end">{r.tvs === null ? t.na : formatCompactUsd(r.tvs)}</td>
                      <td className="py-1 text-end">{r.tvl === null ? t.na : formatCompactUsd(r.tvl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1 text-[11px] text-faint">
                <SourceLink source={SRC.l2beat} /> · <SourceLink source={SRC.defillamaChain} />
              </p>
            </div>
          ) : null}

          {arbL2?.risks.length ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t.risks}: Arbitrum One</h3>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {arbL2.risks.map((r) => (
                  <li key={r.name} className="rounded-lg border border-hairline bg-page px-3 py-2 text-sm">
                    <p className="text-xs text-faint">{r.name}</p>
                    <p
                      className="font-medium"
                      style={{ color: r.sentiment === "bad" ? "var(--status-critical)" : r.sentiment === "warning" ? "var(--status-serious)" : undefined }}
                    >
                      {r.value}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ArbTrendChart
            data={data.trend}
            labels={{ title: t.trend, price: t.trendPrice, tvl: t.trendTvl, stables: t.trendStables }}
            markers={chartMarkers(lang)}
            markerNote={t.eventMarkers}
          />

          <div data-testid={SEL.arbQuality}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{t.quality}</h3>
              <span className="tabular text-xs text-faint">
                {counts.pass} {t.statusPass} · {counts.warn} {t.statusWarn} · {counts.fail} {t.statusFail}
                {counts.skip ? ` · ${counts.skip} ${t.statusSkip}` : ""}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-2">{t.qualityIntro}</p>
            <ul className="mt-2 space-y-2">
              {checks.map((c) => (
                <li
                  key={c.id}
                  data-testid={SEL.arbQualityCheck}
                  data-check={c.id}
                  data-status={c.status}
                  className="rounded-lg border border-hairline bg-page px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckBadge status={c.status} lang={lang} />
                    <span className="text-sm font-medium">{c.label[lang]}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-2">{c.detail[lang]}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Section>
  );
}

interface ChainRow {
  name: string;
  group: "arbitrum" | "competitor";
  stage: string | null;
  tvs: number | null;
  tvl: number | null;
}

/** Merge ETHBEAT projects and DefiLlama chains into one row per chain. */
export function chainRows(live: ArbLive): ChainRow[] {
  const llamaName: Record<string, string> = {
    arbitrum: "Arbitrum",
    robinhood: "Robinhood Chain",
    nova: "Arbitrum Nova",
    base: "Base",
    "op-mainnet": "OP Mainnet",
  };
  const rows: ChainRow[] = [];
  const used = new Set<string>();
  for (const p of live.l2beat ?? []) {
    const ln = llamaName[p.slug];
    const c = live.chains?.find((x) => x.name === ln);
    if (c) used.add(c.name);
    rows.push({ name: p.name, group: p.group, stage: p.stage, tvs: p.tvsUsd, tvl: c?.tvlUsd ?? null });
  }
  for (const c of live.chains ?? []) {
    if (!used.has(c.name)) rows.push({ name: c.name, group: c.group, stage: null, tvs: null, tvl: c.tvlUsd });
  }
  return rows;
}
