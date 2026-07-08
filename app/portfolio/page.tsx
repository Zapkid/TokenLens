"use client";

// Portfolio and watchlist: manual holdings entry, current allocation vs the
// target allocation for the chosen risk profile, tier drift, concrete
// rebalancing suggestions, and the saved watchlist. The portfolio math
// (analyzePortfolio) is implemented and tested in lib/report/strategy.ts;
// this page only renders it.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PositionForm } from "@/components/portfolio/PositionForm";
import { Badge, SectionCard, StatTile } from "@/components/ui";
import { formatPct, formatUsd } from "@/lib/format";
import { analyzePortfolio, TIER_LABELS } from "@/lib/report/strategy";
import { SEL } from "@/lib/selectors";
import {
  useAssetTiers,
  usePositions,
  useRiskProfile,
  useWatchlist,
} from "@/lib/storage";
import type { PriceQuote } from "@/lib/types";

export default function PortfolioPage() {
  const [positions, setPositions] = usePositions();
  const [tiers] = useAssetTiers();
  const [profile] = useRiskProfile();
  const { items: watchlist } = useWatchlist();

  const [quotes, setQuotes] = useState<PriceQuote[]>([]);
  const [priceError, setPriceError] = useState<string | null>(null);

  const idsKey = useMemo(
    () => Array.from(new Set(positions.map((p) => p.assetId))).sort().join(","),
    [positions],
  );

  useEffect(() => {
    if (!idsKey) {
      setQuotes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setPriceError(null);
      try {
        const res = await fetch(`/api/prices?ids=${encodeURIComponent(idsKey)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Price fetch failed");
        if (!cancelled) setQuotes(data.quotes ?? []);
      } catch (e) {
        if (!cancelled) {
          setPriceError(e instanceof Error ? e.message : "Price fetch failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const quoteById = useMemo(() => new Map(quotes.map((q) => [q.id, q])), [quotes]);

  const analysis = useMemo(
    () => analyzePortfolio(positions, quotes, tiers, profile),
    [positions, quotes, tiers, profile],
  );

  const removePosition = (index: number) => {
    setPositions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div data-testid={SEL.portfolioRoot} className="space-y-6">
      <h1 className="text-2xl font-bold">Portfolio and watchlist</h1>

      <SectionCard
        id="add-position"
        title="Add a position"
        subtitle="Manual entry: search for a token, enter quantity and total cost basis in USD"
      >
        <PositionForm />
      </SectionCard>

      <SectionCard
        id="positions"
        title="Positions"
        subtitle="Current holdings, priced from the latest quotes"
      >
        {priceError ? (
          <p className="mb-3 text-xs" style={{ color: "var(--status-critical)" }}>
            Could not refresh prices: {priceError}. Values below may be stale or missing.
          </p>
        ) : null}
        {positions.length === 0 ? (
          <p className="text-sm text-faint">No positions yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {positions.map((p, i) => {
              const quote = quoteById.get(p.assetId);
              const valueUsd = quote?.priceUsd != null ? quote.priceUsd * p.quantity : null;
              const plUsd = valueUsd !== null ? valueUsd - p.costBasisUsd : null;
              const plPct =
                valueUsd !== null && p.costBasisUsd > 0
                  ? (valueUsd - p.costBasisUsd) / p.costBasisUsd
                  : null;
              const tier = tiers[p.assetId];
              return (
                <div
                  key={`${p.assetType}:${p.assetId}:${i}`}
                  data-testid={SEL.positionRow}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-hairline bg-surface p-3 text-sm"
                >
                  <div className="min-w-[120px]">
                    <div className="font-medium">{p.symbol || p.name}</div>
                    <div className="text-xs text-faint">{p.name}</div>
                  </div>
                  <div className="tabular">
                    <div className="text-xs text-faint">Quantity</div>
                    {p.quantity}
                  </div>
                  <div className="tabular">
                    <div className="text-xs text-faint">Cost basis</div>
                    {formatUsd(p.costBasisUsd)}
                  </div>
                  <div className="tabular">
                    <div className="text-xs text-faint">Value</div>
                    {formatUsd(valueUsd)}
                  </div>
                  <div className="tabular">
                    <div className="text-xs text-faint">Unrealized P/L</div>
                    <span
                      style={{
                        color:
                          plUsd === null
                            ? undefined
                            : plUsd >= 0
                              ? "var(--delta-up)"
                              : "var(--delta-down)",
                      }}
                    >
                      {formatUsd(plUsd)} ({formatPct(plPct)})
                    </span>
                  </div>
                  <div>
                    {tier ? (
                      <Badge tone="neutral">{TIER_LABELS[tier]}</Badge>
                    ) : (
                      <Badge tone="warning">
                        Unclassified: open its report to grade it
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePosition(i)}
                    className="ml-auto rounded-md border border-hairline px-2 py-1 text-xs text-ink-2 hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="analysis"
        title="Allocation vs strategy"
        subtitle={`Target allocation for the ${profile} risk profile`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total value" value={formatUsd(analysis.totalValueUsd)} />
        </div>

        {analysis.unpriced.length > 0 ? (
          <div className="mt-4">
            <Badge tone="warning">Unpriced: {analysis.unpriced.join(", ")}</Badge>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table data-testid={SEL.tierTable} className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-faint">
                <th className="pb-2 pr-4">Tier</th>
                <th className="pb-2 pr-4">Target</th>
                <th className="pb-2 pr-4">Actual</th>
                <th className="pb-2 pr-4">Drift</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {analysis.tiers.map((t) => (
                <tr key={t.tier} className="border-t border-hairline">
                  <td className="py-2 pr-4">{TIER_LABELS[t.tier]}</td>
                  <td className="py-2 pr-4 tabular">{t.targetPct.toFixed(0)}%</td>
                  <td className="py-2 pr-4 tabular">{t.actualPct.toFixed(1)}%</td>
                  <td className="py-2 pr-4 tabular">{formatPct(t.relativeDrift)}</td>
                  <td className="py-2">
                    {t.outsideBand ? (
                      <Badge tone="warning">Out of band</Badge>
                    ) : (
                      <Badge tone="good">On target</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4" data-testid={SEL.rebalanceSuggestions}>
          <h3 className="mb-2 text-sm font-medium">Rebalancing suggestions</h3>
          {analysis.suggestions.length === 0 ? (
            <p className="text-sm text-faint">Allocation within bands, nothing to do.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {analysis.suggestions.map((s, i) => (
                <li key={`${s.tier}-${s.action}-${i}`} className="flex items-start gap-2">
                  <Badge tone={s.action === "trim" ? "serious" : "accent"}>{s.action}</Badge>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>

      <SectionCard id="watchlist" title="Watchlist" testId={SEL.watchlistSection}>
        {watchlist.length === 0 ? (
          <p className="text-sm text-faint">
            Your watchlist is empty. Add assets from any report page.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {watchlist.map((a) => (
              <Link
                key={`${a.type}:${a.id}`}
                href={`/report/${a.type}/${encodeURIComponent(a.id)}`}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs hover:border-[var(--series-1)]"
              >
                <span className="font-medium">{a.symbol || a.name}</span>
                <Badge tone={a.type === "chain" ? "accent" : "neutral"}>{a.type}</Badge>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
