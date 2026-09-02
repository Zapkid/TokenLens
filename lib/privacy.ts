// Data subject rights helpers (GDPR Art. 15, 17, 20): export everything this
// site holds about the visitor in their browser, and erase it, including
// the optional server copy kept under the personal sync token. Pure over
// injected Storage and fetch so the logic is unit-testable; the Settings
// page wires it to the real browser.

import { CONSENT_STORAGE_KEY } from "./analytics";

/** Date the privacy notice text was last changed; shown on /privacy. */
export const PRIVACY_POLICY_UPDATED = "2026-09-02";

/** Namespace of every TokenLens preference key in localStorage. */
export const LOCAL_NAMESPACE = "tokenlens:v1:";

/** Non-namespaced keys that are still ours. */
export const EXTRA_LOCAL_KEYS = [CONSENT_STORAGE_KEY];

/** sessionStorage keys that are ours (technical only, still erased). */
export const SESSION_KEYS = ["tl-chunk-reload-at"];

export interface StorageLike {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

function ownKeys(storage: StorageLike): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && (k.startsWith(LOCAL_NAMESPACE) || EXTRA_LOCAL_KEYS.includes(k))) {
      keys.push(k);
    }
  }
  return keys.sort();
}

export interface DataExport {
  site: "TokenLens";
  exportedAt: string;
  format: "tokenlens-data-export/1";
  /** Every stored item, JSON-decoded where possible, raw string otherwise.
   * The personal sync token is redacted: it is a credential, not data
   * about the person, and an export file travels. */
  items: Record<string, unknown>;
}

const TOKEN_KEY = `${LOCAL_NAMESPACE}personalToken`;

export function buildDataExport(
  storage: StorageLike,
  now: Date = new Date(),
): DataExport {
  const items: Record<string, unknown> = {};
  for (const k of ownKeys(storage)) {
    if (k === TOKEN_KEY) {
      items[k] = "[redacted credential]";
      continue;
    }
    const raw = storage.getItem(k);
    try {
      items[k] = raw === null ? null : JSON.parse(raw);
    } catch {
      items[k] = raw;
    }
  }
  return {
    site: "TokenLens",
    exportedAt: now.toISOString(),
    format: "tokenlens-data-export/1",
    items,
  };
}

/** Remove every key that is ours from a storage. Returns the removed keys. */
export function eraseStorage(storage: StorageLike, keys?: string[]): string[] {
  const targets = keys ?? ownKeys(storage);
  for (const k of targets) storage.removeItem(k);
  return targets;
}

/** Read the personal sync token, if configured (stored JSON-encoded). */
export function readPersonalToken(storage: StorageLike): string {
  try {
    const raw = storage.getItem(TOKEN_KEY);
    const v = raw ? JSON.parse(raw) : "";
    return typeof v === "string" ? v.trim() : "";
  } catch {
    return "";
  }
}

export interface EraseResult {
  localKeys: string[];
  sessionKeys: string[];
  /** "none" when no token was set, "cleared" on a 2xx, "failed" otherwise. */
  server: "none" | "cleared" | "failed";
}

/**
 * Full erasure: the server copy first (an empty document with a fresh
 * updatedAt so last-write-wins cannot resurrect the old one), then local
 * and session storage, then caches. Server failure is reported, not
 * hidden, and local erasure still proceeds.
 */
export async function eraseAllData(opts: {
  local: StorageLike;
  session?: StorageLike;
  fetchImpl?: typeof fetch;
  now?: Date;
  cachesImpl?: { keys(): Promise<string[]>; delete(name: string): Promise<boolean> };
}): Promise<EraseResult> {
  const now = opts.now ?? new Date();
  const token = readPersonalToken(opts.local);
  let server: EraseResult["server"] = "none";
  if (token && opts.fetchImpl) {
    try {
      const res = await opts.fetchImpl("/api/personal", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          state: {
            schemaVersion: 1,
            watchlist: [],
            positions: [],
            assetTiers: {},
            updatedAt: now.toISOString(),
          },
        }),
      });
      server = res.ok ? "cleared" : "failed";
    } catch {
      server = "failed";
    }
  }
  const localKeys = eraseStorage(opts.local);
  const sessionKeys = opts.session
    ? eraseStorage(
        opts.session,
        SESSION_KEYS.filter((k) => opts.session!.getItem(k) !== null),
      )
    : [];
  if (opts.cachesImpl) {
    try {
      const names = await opts.cachesImpl.keys();
      await Promise.all(names.map((n) => opts.cachesImpl!.delete(n)));
    } catch {
      // Cache API unavailable (no service worker, private mode): nothing held.
    }
  }
  return { localKeys, sessionKeys, server };
}
