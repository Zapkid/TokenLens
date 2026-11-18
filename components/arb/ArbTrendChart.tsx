"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ArbTrendPoint } from "@/lib/arb/live";
import { SEL } from "@/lib/selectors";

function monthTick(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

// ARB price vs DeFi TVL vs stablecoins, each indexed to 100 on the first
// shared day, so divergence between adoption and token value is visible
// at a glance (question B.5). Charts stay LTR even on the Hebrew page.
export interface ArbChartMarker {
  t: number;
  n: number;
  label: string;
}

export function ArbTrendChart({
  data,
  labels,
  markers = [],
  markerNote,
}: {
  data: ArbTrendPoint[];
  labels: { price: string; tvl: string; stables: string; title: string };
  /** Numbered event markers; only those inside the data range are drawn. */
  markers?: ArbChartMarker[];
  markerNote?: string;
}) {
  if (data.length < 2) return null;
  const first = data[0].t;
  const last = data[data.length - 1].t;
  const visible = markers.filter((m) => m.t >= first && m.t <= last);
  return (
    <figure data-testid={SEL.arbTrendChart} dir="ltr" className="w-full">
      <figcaption className="mb-2 text-sm font-medium text-ink-2">{labels.title}</figcaption>
      <div className="h-64 w-full" role="img" aria-label={labels.title}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
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
              stroke="var(--baseline)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(v) => Number(v).toFixed(1)}
              labelFormatter={(t) => new Date(Number(t)).toLocaleDateString("en-GB", { timeZone: "UTC" })}
              contentStyle={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            <Line type="monotone" dataKey="price" name={labels.price} stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
            <Line type="monotone" dataKey="tvl" name={labels.tvl} stroke="var(--series-2)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
            {visible.map((m) => (
              <ReferenceLine
                key={m.n}
                x={m.t}
                stroke="var(--baseline)"
                strokeDasharray="3 3"
                label={{ value: String(m.n), position: "top", fill: "var(--muted)", fontSize: 10 }}
              />
            ))}
            <Line type="monotone" dataKey="stables" name={labels.stables} stroke="var(--series-3)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {visible.length ? (
        <ol className="mt-2 grid gap-x-4 gap-y-0.5 text-[11px] text-faint sm:grid-cols-2">
          {visible.map((m) => (
            <li key={m.n}>
              <span className="tabular font-medium">{m.n}.</span> {m.label}
            </li>
          ))}
          {markerNote ? <li className="sm:col-span-2">{markerNote}</li> : null}
        </ol>
      ) : null}
    </figure>
  );
}
