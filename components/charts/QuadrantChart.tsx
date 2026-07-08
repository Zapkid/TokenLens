"use client";

// Risk / opportunity quadrant. The subject is the emphasized point; cohort
// peers render in the de-emphasis gray using labeled proxy coordinates.

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SEL } from "@/lib/selectors";
import type { CohortSnapshot } from "@/lib/types";

interface Point {
  x: number;
  y: number;
  name: string;
  subject?: boolean;
}

export function QuadrantChart({
  risk,
  opportunity,
  name,
  cohort,
}: {
  risk: number;
  opportunity: number;
  name: string;
  cohort: CohortSnapshot;
}) {
  const peers: Point[] = cohort.peers
    .filter((p) => p.riskProxy !== null && p.opportunityProxy !== null)
    .map((p) => ({
      x: p.riskProxy as number,
      y: p.opportunityProxy as number,
      name: p.symbol,
    }));
  const subject: Point[] = [{ x: risk, y: opportunity, name, subject: true }];

  return (
    <div data-testid={SEL.quadrantChart}>
      <div
        className="h-72 w-full"
        role="img"
        aria-label={`Quadrant map: ${name} at risk ${Math.round(risk)}, opportunity ${Math.round(opportunity)}`}
      >
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="x"
              name="Risk"
              domain={[0, 100]}
              stroke="var(--baseline)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              label={{
                value: "Risk score",
                position: "insideBottom",
                offset: -4,
                fill: "var(--muted)",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Opportunity"
              domain={[0, 100]}
              stroke="var(--baseline)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              label={{
                value: "Opportunity",
                angle: -90,
                position: "insideLeft",
                fill: "var(--muted)",
                fontSize: 11,
              }}
            />
            <ReferenceLine x={50} stroke="var(--baseline)" />
            <ReferenceLine y={55} stroke="var(--baseline)" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(v, n) => [Math.round(Number(v)), n === "x" ? "Risk" : "Opportunity"]}
              labelFormatter={() => ""}
              content={({ payload }) => {
                const p = payload?.[0]?.payload as Point | undefined;
                if (!p) return null;
                return (
                  <div
                    className="rounded-md border px-2 py-1 text-xs"
                    style={{
                      background: "var(--surface-1)",
                      borderColor: "var(--border-hairline)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-ink-2">
                      risk {Math.round(p.x)}, opportunity {Math.round(p.y)}
                      {p.subject ? "" : " (proxy)"}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={peers} fill="var(--muted)" fillOpacity={0.45} isAnimationActive={false} />
            <Scatter
              data={subject}
              fill="var(--series-1)"
              isAnimationActive={false}
              shape={(props: unknown) => {
                const { cx, cy } = props as { cx?: number; cy?: number };
                if (cx === undefined || cy === undefined) return <g />;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={9} fill="var(--surface-1)" />
                    <circle cx={cx} cy={cy} r={7} fill="var(--series-1)" />
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 text-[11px] text-faint">
        <span>Upper left: Core. Upper right: Speculative bets.</span>
        <span className="text-right">
          Lower left: Stable but stale. Lower right: Avoid.
        </span>
      </div>
      <p className="mt-2 text-xs text-faint">
        Peer positions are proxies (cap percentile for risk, 90d return percentile
        for opportunity), not full scores. Cohort: {cohort.label}.
      </p>
    </div>
  );
}
