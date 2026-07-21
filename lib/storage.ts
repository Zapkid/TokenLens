"use client";

// localStorage-backed persistence for single-user state: watchlist, portfolio,
// weights, risk profile, and the saved-report index used by Compare.
// Values are namespaced and JSON-encoded; hooks stay render-safe on the server.

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_WEIGHTS } from "./constants";
import type { AssetRef, Position, Report, RiskProfile, WeightSet } from "./types";

const NS = "tokenlens:v1:";

/** Event name fired whenever a namespaced key is written. */
export function changeEventName(key: string): string {
  return `${NS}change:${key}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(`${NS}change:${key}`));
  } catch {
    // Storage full or blocked: state stays in memory for the session.
  }
}

/** Non-hook access for modules that sync storage outside React (personal-sync). */
export function readStored<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

export function writeStored<T>(key: string, value: T): void {
  write(key, value);
}

export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const handler = () => setValue(read(key, fallback));
    window.addEventListener(`${NS}change:${key}`, handler);
    return () => window.removeEventListener(`${NS}change:${key}`, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );
  return [value, update] as const;
}

export function useWatchlist() {
  const [items, setItems] = useStoredState<AssetRef[]>("watchlist", []);
  const toggle = useCallback(
    (asset: AssetRef) => {
      setItems((prev) =>
        prev.some((a) => a.id === asset.id && a.type === asset.type)
          ? prev.filter((a) => !(a.id === asset.id && a.type === asset.type))
          : [...prev, asset],
      );
    },
    [setItems],
  );
  const has = useCallback(
    (asset: AssetRef) =>
      items.some((a) => a.id === asset.id && a.type === asset.type),
    [items],
  );
  return { items, toggle, has };
}

export function usePositions() {
  return useStoredState<Position[]>("positions", []);
}

export function useWeights() {
  return useStoredState<WeightSet>("weights", DEFAULT_WEIGHTS);
}

export function useRiskProfile() {
  return useStoredState<RiskProfile>("riskProfile", "balanced");
}

/**
 * Bearer token for server-side personal sync (and the MCP personal tools).
 * Empty string means sync is off and state stays local to this browser.
 */
export function usePersonalToken() {
  return useStoredState<string>("personalToken", "");
}

/**
 * Compare works over previously generated reports. Full reports are heavy, so
 * we keep a bounded shelf of the most recent ones (payload included).
 */
export interface SavedReport {
  savedAt: string;
  report: Report;
}

const MAX_SAVED_REPORTS = 12;

export function useSavedReports() {
  const [saved, setSaved] = useStoredState<SavedReport[]>("savedReports", []);
  const save = useCallback(
    (report: Report) => {
      setSaved((prev) => {
        const without = prev.filter(
          (s) =>
            !(
              s.report.asset.id === report.asset.id &&
              s.report.asset.type === report.asset.type
            ),
        );
        return [{ savedAt: new Date().toISOString(), report }, ...without].slice(
          0,
          MAX_SAVED_REPORTS,
        );
      });
    },
    [setSaved],
  );
  return { saved, save, setSaved };
}

/** Tier classification per asset id, written by report views, read by Portfolio. */
export function useAssetTiers() {
  return useStoredState<Record<string, "core" | "quality" | "speculative" | "avoid">>(
    "assetTiers",
    {},
  );
}
