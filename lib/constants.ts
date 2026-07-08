import type { RiskProfile, WeightSet } from "./types";

export const WEIGHTS_VERSION = 1;

export const DEFAULT_WEIGHTS: WeightSet = {
  version: WEIGHTS_VERSION,
  opportunity: {
    fundamentals: 0.3,
    valuation: 0.2,
    momentum: 0.2,
    development: 0.15,
    narrative: 0.15,
  },
  risk: {
    volatility: 0.2,
    liquidity: 0.15,
    tokenomics: 0.2,
    concentration: 0.15,
    legal: 0.15,
    trackRecord: 0.15,
  },
};

export const OPPORTUNITY_PILLAR_LABELS: Record<
  keyof WeightSet["opportunity"],
  string
> = {
  fundamentals: "Fundamentals and usage",
  valuation: "Valuation headroom",
  momentum: "Momentum and trend",
  development: "Development and ecosystem",
  narrative: "Narrative and catalysts",
};

export const RISK_PILLAR_LABELS: Record<keyof WeightSet["risk"], string> = {
  volatility: "Volatility and drawdown",
  liquidity: "Liquidity",
  tokenomics: "Tokenomics and dilution",
  concentration: "Concentration and dependence",
  legal: "Legal and regulatory",
  trackRecord: "Track record and security",
};

/** Risk aversion multiplier per profile, used in the overall-score dampener. */
export const RISK_AVERSION: Record<RiskProfile, number> = {
  conservative: 0.8,
  balanced: 0.6,
  aggressive: 0.4,
};

export interface AllocationTemplate {
  core: number;
  quality: number;
  speculative: number;
}

export const ALLOCATION_TEMPLATES: Record<RiskProfile, AllocationTemplate> = {
  conservative: { core: 0.7, quality: 0.25, speculative: 0.05 },
  balanced: { core: 0.5, quality: 0.35, speculative: 0.15 },
  aggressive: { core: 0.35, quality: 0.4, speculative: 0.25 },
};

/** Relative drift beyond which the rebalancer proposes trades (25% of target). */
export const REBALANCE_DRIFT_BAND = 0.25;

/** Per position cap inside the alt tiers. */
export const MAX_SINGLE_ALT_PCT = 10;

/** Report cache TTL: crypto fundamentals do not move that fast even if price does. */
export const REPORT_TTL_MS = 24 * 60 * 60 * 1000;
export const MARKET_TTL_MS = 15 * 60 * 1000;
export const LIBRARY_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * FOMC meeting dates are published by the Federal Reserve about a year ahead.
 * Second day of each two-day meeting (the decision day), 2026 schedule.
 */
export const FOMC_DATES_2026: string[] = [
  "2026-01-28",
  "2026-03-18",
  "2026-04-29",
  "2026-06-17",
  "2026-07-29",
  "2026-09-16",
  "2026-10-28",
  "2026-12-09",
];

export const DISCLAIMER =
  "TokenLens is decision support built for personal use. It is not financial advice. No score removes the need to size positions so that a 100% loss on any alt is survivable.";
