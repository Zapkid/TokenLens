// Shared domain types for TokenLens. Keep this file dependency-free: it is
// imported by server pipeline code, client components, and tests alike.

export type AssetType = "token" | "chain";

export interface AssetRef {
  /** Internal id: CoinGecko coin id for tokens, DeFiLlama chain slug for chains. */
  id: string;
  type: AssetType;
  name: string;
  symbol: string;
  image?: string | null;
  /** For chains: the CoinGecko id of the native token, when one exists. */
  coingeckoId?: string | null;
  marketCapRank?: number | null;
  category?: string | null;
}

export interface SearchResult extends AssetRef {
  hint?: string;
}

export type MetricFamily =
  | "market"
  | "supply"
  | "usage"
  | "development"
  | "priceBehavior"
  | "network";

export type MetricFormat = "usd" | "usdCompact" | "pct" | "ratio" | "number";

/** Direction a raw value should be read in when scoring: is higher better, worse, or neither. */
export type MetricDirection = "higher" | "lower" | "neutral";

export interface Metric {
  key: string;
  label: string;
  family: MetricFamily;
  value: number | null;
  format: MetricFormat;
  direction: MetricDirection;
  /** Raw percentile (0 to 100) of the value within the peer cohort, before direction is applied. */
  percentile: number | null;
  note?: string;
}

export type OpportunityPillarKey =
  | "fundamentals"
  | "valuation"
  | "momentum"
  | "development"
  | "narrative";

export type RiskPillarKey =
  | "volatility"
  | "liquidity"
  | "tokenomics"
  | "concentration"
  | "legal"
  | "trackRecord";

export interface PillarInput {
  label: string;
  detail: string;
}

export interface PillarScore {
  key: OpportunityPillarKey | RiskPillarKey;
  label: string;
  /** 0 to 100. Null when the pillar had no usable inputs; weights renormalize around it. */
  score: number | null;
  inputs: PillarInput[];
}

export interface WeightSet {
  version: number;
  opportunity: Record<OpportunityPillarKey, number>;
  risk: Record<RiskPillarKey, number>;
}

export type RiskProfile = "conservative" | "balanced" | "aggressive";

export type RiskGrade = "A" | "B" | "C" | "D" | "E";

export type QuadrantKey = "core" | "speculative" | "stale" | "avoid";

export interface ComputedScores {
  opportunity: number;
  risk: number;
  overall: number;
  riskGrade: RiskGrade;
  quadrant: QuadrantKey;
  riskProfile: RiskProfile;
}

export interface CohortPeer {
  id: string;
  name: string;
  symbol: string;
  marketCap: number | null;
  opportunityProxy?: number | null;
  riskProxy?: number | null;
}

export interface CohortSnapshot {
  label: string;
  size: number;
  peers: CohortPeer[];
}

export type ScenarioKey = "bear" | "base" | "bull";

export interface Scenario {
  key: ScenarioKey;
  probability: number;
  low: number;
  high: number;
  narrative: string;
}

export interface TrajectoryModifier {
  key: string;
  label: string;
  /** Human readable direction and size, e.g. "bull +5, bear -5". */
  effect: string;
  note: string;
}

export interface ScenarioHorizon {
  horizonMonths: 3 | 6 | 12;
  scenarios: Scenario[];
  expectedLow: number;
  expectedHigh: number;
  summary: string;
}

export interface Trajectory {
  kind: "price" | "tvl";
  current: number | null;
  annualizedVol: number | null;
  insufficientHistory: boolean;
  modifiers: TrajectoryModifier[];
  horizons: ScenarioHorizon[];
}

export interface SeriesPoint {
  t: number;
  v: number;
}

export type EventType =
  | "unlock"
  | "macro"
  | "upgrade"
  | "governance"
  | "regulatory"
  | "exchange";

export type EventImpact = "low" | "medium" | "high";

export interface DecisionEvent {
  date: string;
  type: EventType;
  title: string;
  impact: EventImpact;
  scope: "asset" | "category" | "market";
  note?: string;
}

export type RegimeState = "risk-on" | "neutral" | "risk-off";

export interface RegimeComponent {
  label: string;
  value: string;
  /** -1 (bearish) to 1 (bullish) contribution. */
  signal: number;
}

export interface RegimeSnapshot {
  state: RegimeState;
  /** -1 to 1 composite. */
  score: number;
  components: RegimeComponent[];
  fearGreed: { value: number; label: string } | null;
  totalMarketCapUsd: number | null;
  asOf: string;
}

export type StrategyTier = "core" | "quality" | "speculative" | "avoid";

export interface ExitRung {
  trigger: string;
  action: string;
}

export interface StrategyGuidance {
  tier: StrategyTier;
  tierLabel: string;
  rationale: string;
  maxPositionPct: number;
  dcaWeeks: number;
  dcaNote: string;
  exitLadder: ExitRung[];
  reviewTriggers: string[];
}

export interface NetworkProtocol {
  name: string;
  category: string;
  tvl: number;
}

export interface NetworkSection {
  tvl: number | null;
  tvlChange90dPct: number | null;
  fees24hUsd: number | null;
  revenue24hUsd: number | null;
  stablecoinSupplyUsd: number | null;
  protocolCount: number | null;
  topProtocolSharePct: number | null;
  topProtocols: NetworkProtocol[];
  tvlHistory: SeriesPoint[];
}

export type DataMode = "live" | "fixture";

export interface Report {
  schemaVersion: 1;
  asset: AssetRef;
  dataMode: DataMode;
  generatedAt: string;
  ttlExpiresAt: string;
  weightsVersion: number;
  /** Roadmap and legal depth tier. This build only produces auto baselines. */
  reviewTier: "auto-baseline";
  priceHistory: SeriesPoint[];
  metrics: Metric[];
  cohort: CohortSnapshot;
  opportunityPillars: PillarScore[];
  riskPillars: PillarScore[];
  /** Scores computed with the default weight set and balanced profile. Clients recompute live from pillars. */
  scores: ComputedScores;
  riskReasons: string[];
  trajectory: Trajectory;
  tvlTrajectory?: Trajectory;
  network?: NetworkSection;
  events: DecisionEvent[];
  regime: RegimeSnapshot;
  strategy: StrategyGuidance;
  warnings: string[];
}

export interface LibraryEntry {
  asset: AssetRef;
  rank: number;
  marketCap?: number | null;
  tvl?: number | null;
}

export interface Library {
  tokens: LibraryEntry[];
  chains: LibraryEntry[];
  asOf: string;
  dataMode: DataMode;
}

export interface TrendingItem {
  id: string;
  name: string;
  symbol: string;
  change24hPct: number | null;
}

// Portfolio types persist in localStorage only. Keep them stable.

export interface Position {
  assetId: string;
  assetType: AssetType;
  name: string;
  symbol: string;
  quantity: number;
  costBasisUsd: number;
}

export interface PriceQuote {
  id: string;
  priceUsd: number | null;
  change24hPct: number | null;
}
