"use client";

// Trajectory fan chart: a short historical tail plus three scenario bands
// (bear / base / bull) widening toward the horizon. Polarity uses the
// diverging pair (red bear, blue bull) with a neutral gray base band.

import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactUsd } from "@/lib/format";
import { SEL } from "@/lib/selectors";
import type { ScenarioHorizon, SeriesPoint } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

interface FanPoint {
  t: number;
  hist?: number;
  bear?: [number, number];
  base?: [number, number];
  bull?: [number, number];
}

function buildData(
  history: SeriesPoint[],
  horizon: ScenarioHorizon,
  current: number,
): FanPoint[] {
  const tail = history.slice(-120);
  const now = tail.length > 0 ? tail[tail.length - 1].t : Date.now();
  const points: FanPoint[] = tail.map((p) => ({ t: p.t, hist: p.v }));

  const horizonMs = horizon.horizonMonths * 30.44 * DAY_MS;
  const bands: Record<"bear" | "base" | "bull", { low: number; high: number }> = {
    bear: { low: 0, high: 0 },
    base: { low: 0, high: 0 },
    bull: { low: 0, high: 0 },
  };
  for (const s of horizon.scenarios) {
    bands[s.key] = { low: s.low, high: s.high };
  }
  // Interpolate band edges in log space: width grows with sqrt(time).
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const g = Math.sqrt(f);
    const at = (bound: number) => current * Math.exp(Math.log(bound / current) * g);
    points.push({
      t: now + f * horizonMs,
      bear: [at(bands.bear.low), at(bands.bear.high)],
      base: [at(bands.base.low), at(bands.base.high)],
      bull: [at(bands.bull.low), at(bands.bull.high)],
    });
  }
  return points;
}

const SCENARIO_COLORS: Record<"bear" | "base" | "bull", string> = {
  bear: "var(--series-6)",
  base: "var(--muted)",
  bull: "var(--series-1)",
};

export function FanChart({
  history,
  horizon,
  current,
  unitLabel,
}: {
  history: SeriesPoint[];
  horizon: ScenarioHorizon;
  current: number;
  unitLabel: string;
}) {
  const data = buildData(history, horizon, current);
  const probs = Object.fromEntries(
    horizon.scenarios.map((s) => [s.key, s.probability]),
  ) as Record<"bear" | "base" | "bull", number>;

  return (
    <div>
      <div
        className="h-72 w-full"
        data-testid={SEL.fanChart}
        role="img"
        aria-label={`${unitLabel} scenario fan chart over ${horizon.horizonMonths} months`}
      >
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t: number) =>
                new Date(t).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
              }
              stroke="var(--baseline)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompactUsd(v)}
              stroke="var(--baseline)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
              domain={["auto", "auto"]}
              scale="log"
              allowDataOverflow
            />
            <Tooltip
              formatter={(v, name) => {
                if (Array.isArray(v)) {
                  return [
                    `${formatCompactUsd(v[0] as number)} to ${formatCompactUsd(v[1] as number)}`,
                    `${String(name)} range`,
                  ];
                }
                return [formatCompactUsd(Number(v)), unitLabel];
              }}
              labelFormatter={(t) => new Date(Number(t)).toLocaleDateString("en-US")}
              contentStyle={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Area
              dataKey="bull"
              name="bull"
              stroke={SCENARIO_COLORS.bull}
              strokeWidth={1}
              fill={SCENARIO_COLORS.bull}
              fillOpacity={0.18}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Area
              dataKey="base"
              name="base"
              stroke={SCENARIO_COLORS.base}
              strokeWidth={1}
              fill={SCENARIO_COLORS.base}
              fillOpacity={0.22}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Area
              dataKey="bear"
              name="bear"
              stroke={SCENARIO_COLORS.bear}
              strokeWidth={1}
              fill={SCENARIO_COLORS.bear}
              fillOpacity={0.18}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              dataKey="hist"
              name="history"
              stroke="var(--text-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceLine
              y={current}
              stroke="var(--baseline)"
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-2">
        {(["bear", "base", "bull"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: SCENARIO_COLORS[k], opacity: 0.7 }}
            />
            {k} ({probs[k]}%)
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-3"
            style={{ background: "var(--text-primary)" }}
          />
          history
        </span>
      </div>
    </div>
  );
}
