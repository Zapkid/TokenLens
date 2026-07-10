// Global market regime indicator: BTC trend structure, BTC momentum, Fear and
// Greed, and 24h breadth of total market cap. Every report's trajectory model
// draws on this one piece of market-wide state.

import { clamp, simpleMovingAverage, trailingReturn } from "../math";
import type { RegimeComponent, RegimeSnapshot, RegimeState } from "../types";
import type { MarketSnapshotRaw } from "../providers/types";

export function computeRegime(snapshot: MarketSnapshotRaw): RegimeSnapshot {
  const closes = snapshot.btcCloses.map((p) => p.v);
  const price = closes[closes.length - 1] ?? null;
  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const ret30 = trailingReturn(closes, 30);

  const components: RegimeComponent[] = [];

  let trendSignal = 0;
  if (price !== null && sma50 !== null && sma200 !== null) {
    trendSignal = price > sma50 && sma50 > sma200 ? 1 : price < sma50 && sma50 < sma200 ? -1 : 0;
    components.push({
      label: "BTC 50/200d structure",
      value: trendSignal === 1 ? "Uptrend" : trendSignal === -1 ? "Downtrend" : "Mixed",
      signal: trendSignal,
    });
  }

  if (ret30 !== null) {
    const momSignal = clamp(ret30 / 0.15, -1, 1);
    components.push({
      label: "BTC 30d momentum",
      value: `${(ret30 * 100).toFixed(1)}%`,
      signal: momSignal,
    });
  }

  if (snapshot.fearGreed) {
    const fgSignal = clamp((snapshot.fearGreed.value - 50) / 50, -1, 1);
    components.push({
      label: "Fear and Greed",
      value: `${snapshot.fearGreed.value} (${snapshot.fearGreed.label})`,
      signal: fgSignal,
    });
  }

  if (snapshot.marketCapChange24hPct !== null) {
    const breadthSignal = clamp(snapshot.marketCapChange24hPct / 5, -1, 1);
    components.push({
      label: "Total market cap 24h",
      value: `${snapshot.marketCapChange24hPct.toFixed(2)}%`,
      signal: breadthSignal,
    });
  }

  const score =
    components.length > 0
      ? components.reduce((a, c) => a + c.signal, 0) / components.length
      : 0;
  const state: RegimeState = score > 0.2 ? "risk-on" : score < -0.2 ? "risk-off" : "neutral";

  return {
    state,
    score: Math.round(score * 100) / 100,
    components,
    fearGreed: snapshot.fearGreed,
    totalMarketCapUsd: snapshot.totalMarketCapUsd,
    asOf: new Date().toISOString(),
  };
}
