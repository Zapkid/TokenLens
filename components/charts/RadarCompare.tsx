"use client";

// Compare radar: two radial charts (opportunity pillars, risk pillars), one
// series per selected report. Each chart has a single 0-100 radius axis, so
// there is never more than one y-axis to reconcile. Colors are assigned in
// the fixed slot order (series-1, series-2, series-3, series-5) so hue never
// carries meaning beyond "which report."

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { noDataKey } from "@/lib/compare";
import type { RadarChartData, RadarRow, RadarSeriesMeta } from "@/lib/compare";
import { SEL } from "@/lib/selectors";

function PillarRadar({
  rows,
  series,
  title,
}: {
  rows: RadarRow[];
  series: RadarSeriesMeta[];
  title: string;
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-medium text-ink-2">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <RadarChart data={rows} outerRadius="70%">
            <PolarGrid stroke="var(--grid)" />
            <PolarAngleAxis
              dataKey="pillarLabel"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
            />
            {series.map((s) => (
              <Radar
                key={s.seriesId}
                name={s.label}
                dataKey={s.seriesId}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const row = payload[0]?.payload as RadarRow | undefined;
                if (!row) return null;
                return (
                  <div
                    className="rounded-md border px-2 py-1 text-xs"
                    style={{
                      background: "var(--surface-1)",
                      borderColor: "var(--border-hairline)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-medium">{label}</div>
                    {payload.map((p) => {
                      const seriesId = String(p.dataKey);
                      const noData = Boolean(row[noDataKey(seriesId)]);
                      return (
                        <div key={seriesId} style={{ color: p.color as string }}>
                          {p.name}: {Math.round(Number(p.value))}
                          {noData ? " (no data)" : ""}
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RadarCompare({ data }: { data: RadarChartData }) {
  const names = data.series.map((s) => s.label).join(", ");
  return (
    <div
      data-testid={SEL.compareRadar}
      role="img"
      aria-label={`Radar comparison of opportunity and risk pillar scores for ${
        names || "no reports selected"
      }`}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <PillarRadar rows={data.opportunity} series={data.series} title="Opportunity pillars" />
        <PillarRadar rows={data.risk} series={data.series} title="Risk pillars" />
      </div>
    </div>
  );
}
