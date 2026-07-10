// Pure numeric helpers used by metrics, scoring, and trajectory code.

export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stdDev(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1);
  return Math.sqrt(v);
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Daily log returns from a series of closes. */
export function logReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0 && closes[i] > 0) {
      out.push(Math.log(closes[i] / closes[i - 1]));
    }
  }
  return out;
}

/** Annualized realized volatility from daily closes over a trailing window. */
export function annualizedVol(closes: number[], windowDays: number): number | null {
  const window = closes.slice(-Math.min(windowDays + 1, closes.length));
  const rets = logReturns(window);
  if (rets.length < 20) return null;
  return stdDev(rets) * Math.sqrt(365);
}

/** Max drawdown over the series, as a negative fraction (e.g. -0.55). */
export function maxDrawdown(closes: number[]): number | null {
  if (closes.length < 2) return null;
  let peak = closes[0];
  let worst = 0;
  for (const c of closes) {
    if (c > peak) peak = c;
    if (peak > 0) worst = Math.min(worst, c / peak - 1);
  }
  return worst;
}

export function simpleMovingAverage(closes: number[], window: number): number | null {
  if (closes.length < window) return null;
  return mean(closes.slice(-window));
}

/** Trailing return over n days as a fraction, e.g. 0.25 for +25%. */
export function trailingReturn(closes: number[], days: number): number | null {
  if (closes.length < days + 1) return null;
  const then = closes[closes.length - 1 - days];
  const now = closes[closes.length - 1];
  if (then <= 0) return null;
  return now / then - 1;
}

/** Pearson correlation of two equal-length return series. */
export function correlation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 20) return null;
  const xa = a.slice(-n);
  const xb = b.slice(-n);
  const ma = mean(xa);
  const mb = mean(xb);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (xa[i] - ma) * (xb[i] - mb);
    da += (xa[i] - ma) ** 2;
    db += (xb[i] - mb) ** 2;
  }
  if (da === 0 || db === 0) return null;
  return num / Math.sqrt(da * db);
}

/** Sharpe-style ratio: annualized mean daily return over annualized vol, no risk-free leg. */
export function sharpeRatio(closes: number[], windowDays: number): number | null {
  const window = closes.slice(-Math.min(windowDays + 1, closes.length));
  const rets = logReturns(window);
  if (rets.length < 60) return null;
  const vol = stdDev(rets) * Math.sqrt(365);
  if (!vol) return null;
  return (mean(rets) * 365) / vol;
}

/** Downside deviation of daily returns (annualized), negative days only. */
export function downsideDeviation(closes: number[], windowDays: number): number | null {
  const window = closes.slice(-Math.min(windowDays + 1, closes.length));
  const rets = logReturns(window).filter((r) => r < 0);
  if (rets.length < 10) return null;
  const rms = Math.sqrt(mean(rets.map((r) => r * r)));
  return rms * Math.sqrt(365);
}

/**
 * Percentile (0 to 100) of a value within a cohort of values.
 * Fat-tailed metrics should be log-transformed by the caller before ranking.
 */
export function percentileOf(value: number, cohort: number[]): number | null {
  const xs = cohort.filter((x) => Number.isFinite(x));
  if (xs.length < 5) return null;
  const below = xs.filter((x) => x < value).length;
  const equal = xs.filter((x) => x === value).length;
  return clamp(((below + equal / 2) / xs.length) * 100, 0, 100);
}

/** Winsorize a value against cohort bounds so one spike cannot dominate a score. */
export function winsorize(value: number, cohort: number[], pct = 0.05): number {
  const xs = [...cohort].filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (xs.length < 5) return value;
  const lo = xs[Math.floor(xs.length * pct)];
  const hi = xs[Math.min(xs.length - 1, Math.ceil(xs.length * (1 - pct)))];
  return clamp(value, lo, hi);
}

/** Safe log transform for fat-tailed positive metrics; null-passthrough on non-positive. */
export function log10Safe(x: number): number | null {
  return x > 0 ? Math.log10(x) : null;
}
