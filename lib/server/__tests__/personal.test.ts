import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addPositionEntry,
  addWatchlistEntry,
  bearerFrom,
  emptyPersonalState,
  getPersonalState,
  mutatePersonalState,
  parsePersonalState,
  personalTokenConfigured,
  putPersonalState,
  removePositionEntries,
  removeWatchlistEntry,
  resetMemoryStore,
  verifyPersonalToken,
} from "../personal";
import type { PersonalState } from "../personal";

const SOL = { id: "solana", type: "token" as const, name: "Solana", symbol: "SOL" };
const LINK = { id: "chainlink", type: "token" as const, name: "Chainlink", symbol: "LINK" };

function docAt(updatedAt: string): PersonalState {
  return { ...emptyPersonalState(), updatedAt };
}

beforeEach(() => {
  process.env.TOKENLENS_DATA_MODE = "fixture";
  resetMemoryStore();
});

afterEach(() => {
  delete process.env.TOKENLENS_PERSONAL_TOKEN;
});

describe("auth", () => {
  it("is disabled when no token is configured", () => {
    expect(personalTokenConfigured()).toBe(false);
    expect(verifyPersonalToken("anything")).toBe(false);
  });

  it("accepts only the exact configured token", () => {
    process.env.TOKENLENS_PERSONAL_TOKEN = "s3cret-token";
    expect(personalTokenConfigured()).toBe(true);
    expect(verifyPersonalToken("s3cret-token")).toBe(true);
    expect(verifyPersonalToken("s3cret-toke")).toBe(false);
    expect(verifyPersonalToken("")).toBe(false);
    expect(verifyPersonalToken(null)).toBe(false);
  });

  it("extracts bearer tokens case-insensitively", () => {
    expect(bearerFrom("Bearer abc")).toBe("abc");
    expect(bearerFrom("bearer abc")).toBe("abc");
    expect(bearerFrom("Basic abc")).toBeNull();
    expect(bearerFrom(null)).toBeNull();
  });
});

describe("parsePersonalState", () => {
  it("round-trips a valid document", () => {
    const doc = addWatchlistEntry(docAt(new Date().toISOString()), SOL);
    expect(parsePersonalState(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  });

  it("rejects malformed documents", () => {
    expect(() => parsePersonalState(null)).toThrow(/Malformed/);
    expect(() => parsePersonalState({})).toThrow(/Malformed/);
    expect(() =>
      parsePersonalState({ ...emptyPersonalState(), watchlist: "nope" }),
    ).toThrow(/Malformed/);
    expect(() =>
      parsePersonalState({
        ...emptyPersonalState(),
        positions: [{ assetId: "x", assetType: "token", quantity: -1, costBasisUsd: 0 }],
      }),
    ).toThrow(/Malformed/);
  });
});

describe("store operations (memory backend)", () => {
  it("starts empty and persists mutations", async () => {
    const empty = await getPersonalState();
    expect(empty.watchlist).toEqual([]);
    const next = await mutatePersonalState((s) => addWatchlistEntry(s, SOL));
    expect(next.watchlist).toHaveLength(1);
    const readBack = await getPersonalState();
    expect(readBack.watchlist[0].id).toBe("solana");
    expect(Date.parse(readBack.updatedAt)).toBeGreaterThan(0);
  });

  it("last write wins: stale puts are rejected with the newer document", async () => {
    const newer = { ...docAt("2026-07-21T12:00:00.000Z"), watchlist: [SOL] };
    await putPersonalState(newer);
    const stale = { ...docAt("2026-07-21T11:00:00.000Z"), watchlist: [LINK] };
    const result = await putPersonalState(stale);
    expect(result.applied).toBe(false);
    expect(result.state.watchlist[0].id).toBe("solana");
    const fresh = { ...docAt("2026-07-21T13:00:00.000Z"), watchlist: [LINK] };
    const applied = await putPersonalState(fresh);
    expect(applied.applied).toBe(true);
    expect((await getPersonalState()).watchlist[0].id).toBe("chainlink");
  });
});

describe("supabase backend", () => {
  const doc = { ...emptyPersonalState(), watchlist: [SOL], updatedAt: "2026-07-22T09:00:00.000Z" };

  beforeEach(() => {
    delete process.env.TOKENLENS_DATA_MODE;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    process.env.TOKENLENS_DATA_MODE = "fixture";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.unstubAllGlobals();
  });

  it("reads the singleton row via PostgREST with service role auth", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([{ doc }]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const state = await getPersonalState();
    expect(state.watchlist[0].id).toBe("solana");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      "https://example.supabase.co/rest/v1/personal_state?id=eq.singleton&select=doc",
    );
    const headers = init.headers as Record<string, string>;
    expect(headers.apikey).toBe("service-role-key");
    expect(headers.authorization).toBe("Bearer service-role-key");
  });

  it("returns the empty document when no row exists yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("[]", { status: 200 })),
    );
    const state = await getPersonalState();
    expect(state.watchlist).toEqual([]);
  });

  it("writes via upsert and surfaces backend failures", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") return new Response(null, { status: 201 });
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    await mutatePersonalState((s) => addWatchlistEntry(s, SOL));
    const postCall = fetchMock.mock.calls.find(
      (c) => (c[1] as RequestInit | undefined)?.method === "POST",
    )!;
    const init = postCall[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.prefer).toContain("resolution=merge-duplicates");
    const body = JSON.parse(init.body as string) as { id: string; doc: unknown }[];
    expect(body[0].id).toBe("singleton");

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("denied", { status: 401 })),
    );
    await expect(getPersonalState()).rejects.toThrow(/unavailable \(401\)/);
  });

  it("takes precedence over Upstash when both are configured", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    const fetchMock = vi.fn(async (url: string) => {
      void url;
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    await getPersonalState();
    expect(String(fetchMock.mock.calls[0][0])).toContain("supabase.co");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });
});

describe("domain mutations", () => {
  it("watchlist add is idempotent and remove is keyed by id and type", () => {
    let s = emptyPersonalState();
    s = addWatchlistEntry(s, SOL);
    s = addWatchlistEntry(s, SOL);
    expect(s.watchlist).toHaveLength(1);
    s = addWatchlistEntry(s, { ...SOL, id: "solana", type: "chain" });
    expect(s.watchlist).toHaveLength(2);
    s = removeWatchlistEntry(s, "solana", "chain");
    expect(s.watchlist).toEqual([SOL]);
  });

  it("positions allow multiple lots and remove clears all lots for an asset", () => {
    let s = emptyPersonalState();
    const lot = {
      assetId: "solana",
      assetType: "token" as const,
      name: "Solana",
      symbol: "SOL",
      quantity: 2,
      costBasisUsd: 300,
    };
    s = addPositionEntry(s, lot);
    s = addPositionEntry(s, { ...lot, quantity: 1, costBasisUsd: 180 });
    s = addPositionEntry(s, { ...lot, assetId: "chainlink", symbol: "LINK" });
    expect(s.positions).toHaveLength(3);
    s = removePositionEntries(s, "solana");
    expect(s.positions).toHaveLength(1);
    expect(s.positions[0].assetId).toBe("chainlink");
  });
});
