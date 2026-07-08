// Scenario trajectories: a statistical volatility cone adjusted by structured,
// visible modifiers. Ranges and drivers, never a single price target.

import { annualizedVol, clamp } from "../math";
import type {
  DecisionEvent,
  RegimeState,
  Scenario,
  ScenarioHorizon,
  SeriesPoint,
  Trajectory,
  TrajectoryModifier,
} from "../types";

export interface TrajectoryContext {
  regimeState: RegimeState;
  /** Percentile of current value within own trailing history, 0-100. */
  ownHistoryPercentile: number | null;
  /** MC/FDV for dilution pressure; null for TVL trajectories. */
  mcFdvRatio: number | null;
  /** 1 uptrend, -1 downtrend, 0 mixed, null unknown. */
  trendStructure: number | null;
  /** Dated events that could move the asset within 12 months. */
  events: DecisionEvent[];
}

const HORIZONS: (3 | 6 | 12)[] = [3, 6, 12];

interface ProbShift {
  bear: number;
  bull: number;
}

function buildModifiers(ctx: TrajectoryContext): {
  modifiers: TrajectoryModifier[];
  shift: ProbShift;
  bearWiden: number;
  bullWiden: number;
} {
  const modifiers: TrajectoryModifier[] = [];
  const shift: ProbShift = { bear: 0, bull: 0 };
  let bearWiden = 0;
  let bullWiden = 0;

  if (ctx.regimeState === "risk-on") {
    shift.bull += 6;
    shift.bear -= 6;
    modifiers.push({
      key: "regime",
      label: "Market regime",
      effect: "bull +6, bear -6",
      note: "Global regime indicator is risk-on",
    });
  } else if (ctx.regimeState === "risk-off") {
    shift.bull -= 6;
    shift.bear += 6;
    modifiers.push({
      key: "regime",
      label: "Market regime",
      effect: "bull -6, bear +6",
      note: "Global regime indicator is risk-off; bull case probability is capped",
    });
  } else {
    modifiers.push({
      key: "regime",
      label: "Market regime",
      effect: "no shift",
      note: "Global regime indicator is neutral",
    });
  }

  if (ctx.ownHistoryPercentile !== null) {
    if (ctx.ownHistoryPercentile >= 90) {
      shift.bull -= 6;
      shift.bear += 6;
      modifiers.push({
        key: "valuation",
        label: "Valuation band",
        effect: "bull -6, bear +6",
        note: "Trading in the top decile of its own 2 year range; bull case trimmed",
      });
    } else if (ctx.ownHistoryPercentile <= 10) {
      shift.bull += 6;
      shift.bear -= 6;
      modifiers.push({
        key: "valuation",
        label: "Valuation band",
        effect: "bull +6, bear -6",
        note: "Trading in the bottom decile of its own 2 year range",
      });
    }
  }

  if (ctx.mcFdvRatio !== null && ctx.mcFdvRatio < 0.6) {
    shift.bear += 5;
    bearWiden += 0.25;
    modifiers.push({
      key: "dilution",
      label: "Unlock and dilution pressure",
      effect: "bear +5, bear range widened",
      note: `Only ${Math.round(ctx.mcFdvRatio * 100)}% of fully diluted supply circulates; emissions weigh on price`,
    });
  }

  if (ctx.trendStructure === 1) {
    shift.bull += 4;
    shift.bear -= 4;
    modifiers.push({
      key: "trend",
      label: "Trend structure",
      effect: "bull +4, bear -4",
      note: "Price above the 50d average, 50d above the 200d",
    });
  } else if (ctx.trendStructure === -1) {
    shift.bull -= 4;
    shift.bear += 4;
    modifiers.push({
      key: "trend",
      label: "Trend structure",
      effect: "bull -4, bear +4",
      note: "Price below the 50d average, 50d below the 200d",
    });
  }

  const highImpact = ctx.events.filter((e) => e.impact === "high");
  if (highImpact.length > 0) {
    bearWiden += 0.2;
    bullWiden += 0.2;
    modifiers.push({
      key: "decisions",
      label: "Pending decisions",
      effect: "both tails widened",
      note: `${highImpact.length} high impact dated event(s) inside the horizon: ${highImpact
        .slice(0, 2)
        .map((e) => e.title)
        .join("; ")}. Binary events make ranges honest and point estimates dishonest.`,
    });
  }

  return { modifiers, shift, bearWiden, bullWiden };
}

function scenarioNarrative(
  key: Scenario["key"],
  ctx: TrajectoryContext,
): string {
  if (key === "base") {
    return ctx.trendStructure === 1
      ? "Trend intact, consolidation within the cone"
      : ctx.trendStructure === -1
        ? "Downtrend persists but stabilizes inside the cone"
        : "Range-bound drift within historical volatility";
  }
  if (key === "bear") {
    const parts = ["Historical downside volatility plays out"];
    if (ctx.mcFdvRatio !== null && ctx.mcFdvRatio < 0.6)
      parts.push("supply emissions add pressure");
    if (ctx.regimeState === "risk-off") parts.push("regime stays risk-off");
    return parts.join(", ");
  }
  const parts = ["Upside volatility plays out"];
  if (ctx.regimeState !== "risk-on") parts.push("requires the regime to turn risk-on");
  if (ctx.ownHistoryPercentile !== null && ctx.ownHistoryPercentile >= 90)
    parts.push("from an already stretched valuation band");
  return parts.join(", ");
}

export function computeTrajectory(
  kind: "price" | "tvl",
  series: SeriesPoint[],
  ctx: TrajectoryContext,
): Trajectory {
  const closes = series.map((p) => p.v);
  const current = closes.length > 0 ? closes[closes.length - 1] : null;
  const vol = annualizedVol(closes, 365);

  if (current === null || vol === null || closes.length < 180) {
    return {
      kind,
      current,
      annualizedVol: vol,
      insufficientHistory: true,
      modifiers: [],
      horizons: [],
    };
  }

  const { modifiers, shift, bearWiden, bullWiden } = buildModifiers(ctx);

  const horizons: ScenarioHorizon[] = HORIZONS.map((h) => {
    const sigma = vol * Math.sqrt(h / 12);
    const bear: Scenario = {
      key: "bear",
      probability: clamp(25 + shift.bear, 5, 60),
      low: current * Math.exp(-(1.5 + bearWiden) * sigma),
      high: current * Math.exp(-0.5 * sigma),
      narrative: scenarioNarrative("bear", ctx),
    };
    const bull: Scenario = {
      key: "bull",
      probability: clamp(25 + shift.bull, 5, 60),
      low: current * Math.exp(0.5 * sigma),
      high: current * Math.exp((1.5 + bullWiden) * sigma),
      narrative: scenarioNarrative("bull", ctx),
    };
    const base: Scenario = {
      key: "base",
      probability: 100 - bear.probability - bull.probability,
      low: current * Math.exp(-0.5 * sigma),
      high: current * Math.exp(0.5 * sigma),
      narrative: scenarioNarrative("base", ctx),
    };
    const scenarios = [bear, base, bull];
    const expectedLow = scenarios.reduce((a, s) => a + (s.probability / 100) * s.low, 0);
    const expectedHigh = scenarios.reduce(
      (a, s) => a + (s.probability / 100) * s.high,
      0,
    );
    const summary = `Base case (${base.probability}%): ${base.narrative}. Bear (${bear.probability}%): ${bear.narrative}. Bull (${bull.probability}%): ${bull.narrative}.`;
    return { horizonMonths: h, scenarios, expectedLow, expectedHigh, summary };
  });

  return {
    kind,
    current,
    annualizedVol: vol,
    insufficientHistory: false,
    modifiers,
    horizons,
  };
}
