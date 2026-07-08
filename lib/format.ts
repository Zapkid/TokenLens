import type { MetricFormat } from "./types";

export function formatUsd(x: number | null | undefined, digits?: number): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "n/a";
  const d = digits ?? (Math.abs(x) >= 1000 ? 0 : Math.abs(x) >= 1 ? 2 : 4);
  return x.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function formatCompactUsd(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "n/a";
  const abs = Math.abs(x);
  if (abs >= 1e12) return `$${(x / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(x / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(x / 1e3).toFixed(1)}K`;
  return formatUsd(x);
}

export function formatPct(x: number | null | undefined, digits = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "n/a";
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(digits)}%`;
}

export function formatRatio(x: number | null | undefined, digits = 2): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "n/a";
  return x.toFixed(digits);
}

export function formatNumber(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "n/a";
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatMetric(value: number | null, format: MetricFormat): string {
  if (value === null) return "n/a";
  switch (format) {
    case "usd":
      return formatUsd(value);
    case "usdCompact":
      return formatCompactUsd(value);
    case "pct":
      return formatPct(value);
    case "ratio":
      return formatRatio(value);
    case "number":
      return formatNumber(value);
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
