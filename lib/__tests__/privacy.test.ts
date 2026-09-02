import { describe, expect, it, vi } from "vitest";
import {
  EXTRA_LOCAL_KEYS,
  LOCAL_NAMESPACE,
  buildDataExport,
  eraseAllData,
  eraseStorage,
  readPersonalToken,
  type StorageLike,
} from "../privacy";

function memStorage(init: Record<string, string> = {}): StorageLike & {
  dump(): Record<string, string>;
} {
  const map = new Map(Object.entries(init));
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    dump: () => Object.fromEntries(map),
  };
}

const NOW = new Date("2026-09-02T12:00:00.000Z");

describe("buildDataExport", () => {
  it("collects only our keys, decodes JSON, keeps raw strings, redacts the token", () => {
    const s = memStorage({
      [`${LOCAL_NAMESPACE}watchlist`]: JSON.stringify([{ id: "bitcoin", type: "token" }]),
      [`${LOCAL_NAMESPACE}riskProfile`]: JSON.stringify("balanced"),
      [`${LOCAL_NAMESPACE}personalToken`]: JSON.stringify("secret-token"),
      [`${LOCAL_NAMESPACE}broken`]: "{not json",
      "bdcc-ad-consent": JSON.stringify({ choice: "denied", at: NOW.toISOString(), version: 2 }),
      "some-other-site": "ignored",
    });
    const doc = buildDataExport(s, NOW);
    expect(doc.site).toBe("TokenLens");
    expect(doc.format).toBe("tokenlens-data-export/1");
    expect(doc.exportedAt).toBe(NOW.toISOString());
    expect(Object.keys(doc.items)).toEqual(
      [
        "bdcc-ad-consent",
        `${LOCAL_NAMESPACE}broken`,
        `${LOCAL_NAMESPACE}personalToken`,
        `${LOCAL_NAMESPACE}riskProfile`,
        `${LOCAL_NAMESPACE}watchlist`,
      ].sort(),
    );
    expect(doc.items[`${LOCAL_NAMESPACE}watchlist`]).toEqual([{ id: "bitcoin", type: "token" }]);
    expect(doc.items[`${LOCAL_NAMESPACE}riskProfile`]).toBe("balanced");
    expect(doc.items[`${LOCAL_NAMESPACE}broken`]).toBe("{not json");
    expect(doc.items[`${LOCAL_NAMESPACE}personalToken`]).toBe("[redacted credential]");
    expect(JSON.stringify(doc)).not.toContain("secret-token");
    expect(doc.items).not.toHaveProperty("some-other-site");
  });

  it("is empty but well formed for a fresh browser", () => {
    expect(buildDataExport(memStorage(), NOW).items).toEqual({});
  });
});

describe("eraseStorage", () => {
  it("removes namespaced and extra keys and nothing else", () => {
    const s = memStorage({
      [`${LOCAL_NAMESPACE}a`]: "1",
      [EXTRA_LOCAL_KEYS[0]]: "2",
      foreign: "3",
    });
    const removed = eraseStorage(s);
    expect(removed.sort()).toEqual([EXTRA_LOCAL_KEYS[0], `${LOCAL_NAMESPACE}a`].sort());
    expect(s.dump()).toEqual({ foreign: "3" });
  });
});

describe("readPersonalToken", () => {
  it("decodes the JSON-encoded token and tolerates junk", () => {
    expect(readPersonalToken(memStorage())).toBe("");
    expect(
      readPersonalToken(memStorage({ [`${LOCAL_NAMESPACE}personalToken`]: '" tok "' })),
    ).toBe("tok");
    expect(
      readPersonalToken(memStorage({ [`${LOCAL_NAMESPACE}personalToken`]: "{" })),
    ).toBe("");
  });
});

describe("eraseAllData", () => {
  it("clears the server copy with an empty, freshly stamped document when a token is set", async () => {
    const local = memStorage({
      [`${LOCAL_NAMESPACE}personalToken`]: JSON.stringify("tok"),
      [`${LOCAL_NAMESPACE}watchlist`]: "[]",
    });
    const session = memStorage({ "tl-chunk-reload-at": "1", other: "x" });
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const deleted: string[] = [];
    const result = await eraseAllData({
      local,
      session,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: NOW,
      cachesImpl: {
        keys: async () => ["tokenlens-v1-pages"],
        delete: async (n) => {
          deleted.push(n);
          return true;
        },
      },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/personal");
    expect(init.method).toBe("PUT");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok");
    expect(JSON.parse(String(init.body))).toEqual({
      state: {
        schemaVersion: 1,
        watchlist: [],
        positions: [],
        assetTiers: {},
        updatedAt: NOW.toISOString(),
      },
    });
    expect(result.server).toBe("cleared");
    expect(result.localKeys.sort()).toEqual(
      [`${LOCAL_NAMESPACE}personalToken`, `${LOCAL_NAMESPACE}watchlist`].sort(),
    );
    expect(result.sessionKeys).toEqual(["tl-chunk-reload-at"]);
    expect(local.dump()).toEqual({});
    expect(session.dump()).toEqual({ other: "x" });
    expect(deleted).toEqual(["tokenlens-v1-pages"]);
  });

  it("skips the server without a token and still erases locally", async () => {
    const local = memStorage({ [`${LOCAL_NAMESPACE}weights`]: "{}" });
    const fetchImpl = vi.fn();
    const result = await eraseAllData({
      local,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.server).toBe("none");
    expect(local.dump()).toEqual({});
  });

  it("reports a failed server erase instead of hiding it, and still erases locally", async () => {
    const local = memStorage({
      [`${LOCAL_NAMESPACE}personalToken`]: JSON.stringify("tok"),
    });
    const result = await eraseAllData({
      local,
      fetchImpl: (async () => new Response("nope", { status: 401 })) as unknown as typeof fetch,
    });
    expect(result.server).toBe("failed");
    expect(local.dump()).toEqual({});
    const thrown = await eraseAllData({
      local: memStorage({ [`${LOCAL_NAMESPACE}personalToken`]: JSON.stringify("tok") }),
      fetchImpl: (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch,
    });
    expect(thrown.server).toBe("failed");
  });
});
