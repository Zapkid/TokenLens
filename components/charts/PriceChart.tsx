"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactUsd } from "@/lib/format";
import type { SeriesPoint } from "@/lib/types";

function monthTick(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function PriceChart({
  series,
  label,
}: {
  series: SeriesPoint[];
  label: string;
}) {
  if (series.length < 2) {
    return <p className="text-sm text-faint">Not enough history to chart.</p>;
  }
  return (
    <div className="h-56 w-full" role="img" aria-label={`${label} history chart`}>
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--seq-450)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--seq-450)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={monthTick}
            stroke="var(--baseline)"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            dataKey="v"
            tickFormatter={(v: number) => formatCompactUsd(v)}
            stroke="var(--baseline)"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(v) => [formatCompactUsd(Number(v)), label]}
            labelFormatter={(t) => new Date(Number(t)).toLocaleDateString("en-US")}
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 8,
              color: "var(--text-primary)",
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--seq-450)"
            strokeWidth={2}
            fill="url(#priceFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
