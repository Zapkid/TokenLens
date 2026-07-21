// Server-side personal state: watchlist, portfolio positions, and asset
// tiers, shared between the web UI (via /api/personal sync) and the MCP
// personal tools. Single-user by design: one state document, last write
// wins on updatedAt.
//
// The whole surface is env-gated behind TOKENLENS_PERSONAL_TOKEN. When the
// token is unset the store is unreachable: the REST route answers 501 and
// the MCP personal tools are not registered. Never weaken this: personal
// state must not be readable or writable anonymously.
//
// Backends, chosen at call time:
// - fixture data mode: in-memory (deterministic for tests, empty at boot)
// - Upstash Redis REST when UPSTASH_REDIS_REST_URL and _TOKEN are set
//   (persistent state on serverless deployments such as Vercel)
// - otherwise a JSON file under TOKENLENS_DATA_DIR (default .data/),
//   which persists on local and self-hosted deployments

import { createHash, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AssetRef, Position, StrategyTier } from "../types";

export interface PersonalState {
  schemaVersion: 1;
  watchlist: AssetRef[];
  positions: Position[];
  assetTiers: Record<string, StrategyTier>;
  updatedAt: string;
}

export function emptyPersonalState(): PersonalState {
  return {
    schemaVersion: 1,
    watchlist: [],
    positions: [],
    assetTiers: {},
    updatedAt: new Date(0).toISOString(),
  };
}

/** Shape-check an incoming document; throws on malformed input. */
export function parsePersonalState(raw: unknown): PersonalState {
  const s = raw as Partial<PersonalState> | null;
  if (
    !s ||
    s.schemaVersion !== 1 ||
    !Array.isArray(s.watchlist) ||
    !Array.isArray(s.positions) ||
    typeof s.assetTiers !== "object" ||
    s.assetTiers === null ||
    typeof s.updatedAt !== "string" ||
    Number.isNaN(Date.parse(s.updatedAt))
  ) {
    throw new Error("Malformed personal state document");
  }
  for (const a of s.watchlist) {
    if (typeof a.id !== "string" || (a.type !== "token" && a.type !== "chain")) {
      throw new Error("Malformed watchlist entry");
    }
  }
  for (const p of s.positions) {
    if (
      typeof p.assetId !== "string" ||
      (p.assetType !== "token" && p.assetType !== "chain") ||
      typeof p.quantity !== "number" ||
      !Number.isFinite(p.quantity) ||
      p.quantity <= 0 ||
      typeof p.costBasisUsd !== "number" ||
      !Number.isFinite(p.costBasisUsd) ||
      p.costBasisUsd < 0
    ) {
      throw new Error("Malformed position entry");
    }
  }
  return s as PersonalState;
}

// --- Auth ---

export function personalTokenConfigured(): boolean {
  return Boolean(process.env.TOKENLENS_PERSONAL_TOKEN);
}

/**
 * Constant-time bearer token check. Hashing first makes lengths equal so
 * timingSafeEqual applies and no length information leaks.
 */
export function verifyPersonalToken(presented: string | undefined | null): boolean {
  const expected = process.env.TOKENLENS_PERSONAL_TOKEN;
  if (!expected || !presented) return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Extract a bearer token from an Authorization header value. */
export function bearerFrom(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

// --- Backends ---

interface PersonalStore {
  get(): Promise<PersonalState>;
  put(state: PersonalState): Promise<void>;
}

const memory: { state: PersonalState | null } = { state: null };

const memoryStore: PersonalStore = {
  async get() {
    return memory.state ?? emptyPersonalState();
  },
  async put(state) {
    memory.state = state;
  },
};

/** Test hook: reset the in-memory backend between unit tests. */
export function resetMemoryStore(): void {
  memory.state = null;
}

function fileStore(): PersonalStore {
  const dir = process.env.TOKENLENS_DATA_DIR ?? path.join(process.cwd(), ".data");
  const file = path.join(dir, "personal.json");
  return {
    async get() {
      try {
        return parsePersonalState(JSON.parse(await readFile(file, "utf8")));
      } catch {
        return emptyPersonalState();
      }
    },
    async put(state) {
      await mkdir(dir, { recursive: true });
      await writeFile(file, JSON.stringify(state, null, 2), "utf8");
    },
  };
}

const UPSTASH_KEY = "tokenlens:personal:v1";

function upstashStore(url: string, token: string): PersonalStore {
  async function command(cmd: unknown[]): Promise<unknown> {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(cmd),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Personal store unavailable (${res.status})`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(`Personal store error: ${data.error}`);
    return data.result;
  }
  return {
    async get() {
      const raw = await command(["GET", UPSTASH_KEY]);
      if (typeof raw !== "string" || !raw) return emptyPersonalState();
      try {
        return parsePersonalState(JSON.parse(raw));
      } catch {
        return emptyPersonalState();
      }
    },
    async put(state) {
      await command(["SET", UPSTASH_KEY, JSON.stringify(state)]);
    },
  };
}

function getStore(): PersonalStore {
  if (process.env.TOKENLENS_DATA_MODE === "fixture") return memoryStore;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return upstashStore(url, token);
  return fileStore();
}

// --- Operations ---

export async function getPersonalState(): Promise<PersonalState> {
  return getStore().get();
}

/**
 * Replace the whole document, last write wins: the incoming updatedAt must
 * be at or after the stored one, otherwise the stored (newer) document is
 * returned unchanged with applied: false so the caller can reconcile.
 */
export async function putPersonalState(
  incoming: PersonalState,
): Promise<{ state: PersonalState; applied: boolean }> {
  const store = getStore();
  const current = await store.get();
  if (Date.parse(incoming.updatedAt) < Date.parse(current.updatedAt)) {
    return { state: current, applied: false };
  }
  await store.put(incoming);
  return { state: incoming, applied: true };
}

/** Apply a mutation to the current document, stamping a fresh updatedAt. */
export async function mutatePersonalState(
  mutate: (state: PersonalState) => PersonalState,
): Promise<PersonalState> {
  const store = getStore();
  const next = { ...mutate(await store.get()), updatedAt: new Date().toISOString() };
  await store.put(next);
  return next;
}

// --- Domain mutations shared by the MCP tools ---

export function addWatchlistEntry(state: PersonalState, asset: AssetRef): PersonalState {
  const exists = state.watchlist.some(
    (a) => a.id === asset.id && a.type === asset.type,
  );
  return exists
    ? state
    : { ...state, watchlist: [...state.watchlist, asset] };
}

export function removeWatchlistEntry(
  state: PersonalState,
  id: string,
  type: AssetRef["type"],
): PersonalState {
  return {
    ...state,
    watchlist: state.watchlist.filter((a) => !(a.id === id && a.type === type)),
  };
}

export function addPositionEntry(state: PersonalState, position: Position): PersonalState {
  return { ...state, positions: [...state.positions, position] };
}

/** Removes every lot held for the asset id. */
export function removePositionEntries(state: PersonalState, assetId: string): PersonalState {
  return {
    ...state,
    positions: state.positions.filter((p) => p.assetId !== assetId),
  };
}
