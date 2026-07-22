"use client";

// Client half of personal state sync. localStorage stays the source the
// UI renders from; when a personal token is configured in Settings, this
// module mirrors watchlist, positions, and asset tiers to the server so
// the MCP personal tools see and mutate the same state.
//
// Model: whole-document last write wins. Every local mutation bumps a
// local updatedAt; reconcile() compares it with the server document and
// either pushes the local state or applies the server one.

import { changeEventName, readStored, writeStored } from "./storage";
import type { AssetRef, Position, StrategyTier } from "./types";

export interface PersonalStateDoc {
  schemaVersion: 1;
  watchlist: AssetRef[];
  positions: Position[];
  assetTiers: Record<string, StrategyTier>;
  updatedAt: string;
}

/** The storage keys this module mirrors. */
export const SYNCED_KEYS = ["watchlist", "positions", "assetTiers"] as const;

const UPDATED_AT_KEY = "personalUpdatedAt";
const EPOCH = new Date(0).toISOString();

export type SyncAction = "pull" | "push" | "noop";

/** Pure decision: which side wins for two ISO timestamps. */
export function resolveSyncAction(localIso: string, serverIso: string): SyncAction {
  const local = Date.parse(localIso);
  const server = Date.parse(serverIso);
  if (Number.isNaN(local)) return Number.isNaN(server) ? "noop" : "pull";
  if (Number.isNaN(server)) return "push";
  if (server > local) return "pull";
  if (local > server) return "push";
  return "noop";
}

export function readLocalDoc(): PersonalStateDoc {
  return {
    schemaVersion: 1,
    watchlist: readStored<AssetRef[]>("watchlist", []),
    positions: readStored<Position[]>("positions", []),
    assetTiers: readStored<Record<string, StrategyTier>>("assetTiers", {}),
    updatedAt: readStored<string>(UPDATED_AT_KEY, EPOCH),
  };
}

export function markLocalChanged(): void {
  writeStored(UPDATED_AT_KEY, new Date().toISOString());
}

export function applyServerDoc(doc: PersonalStateDoc): void {
  writeStored("watchlist", doc.watchlist);
  writeStored("positions", doc.positions);
  writeStored("assetTiers", doc.assetTiers);
  writeStored(UPDATED_AT_KEY, doc.updatedAt);
}

async function fetchServerDoc(token: string): Promise<PersonalStateDoc | null> {
  const res = await fetch("/api/personal", {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.state as PersonalStateDoc) ?? null;
}

async function pushLocalDoc(token: string, doc: PersonalStateDoc): Promise<void> {
  const res = await fetch("/api/personal", {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ state: doc }),
  });
  if (res.ok) {
    // The server may have rejected a stale write and returned its newer
    // document; applying the response keeps both sides converged.
    const data = await res.json();
    if (data?.state && data.applied === false) {
      applyServerDoc(data.state as PersonalStateDoc);
    }
  }
}

/**
 * One reconcile pass: compare timestamps, then pull or push. Returns the
 * action taken so the caller (and tests) can observe the decision.
 */
export async function reconcile(token: string): Promise<SyncAction> {
  const server = await fetchServerDoc(token);
  if (!server) return "noop";
  const local = readLocalDoc();
  const action = resolveSyncAction(local.updatedAt, server.updatedAt);
  if (action === "pull") applyServerDoc(server);
  if (action === "push") await pushLocalDoc(token, local);
  return action;
}

export { changeEventName };
