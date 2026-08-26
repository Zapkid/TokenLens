import { afterEach, describe, expect, it } from "vitest";
import {
  API_VERSION,
  _resetRateLimitForTests,
  apiHeaders,
  apiNotFoundResponse,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitMax,
  rateLimitedResponse,
} from "../api-http";

const T0 = 1_700_000_000_000;

afterEach(() => _resetRateLimitForTests());

describe("checkRateLimit", () => {
  it("allows up to the limit inside a window, then denies", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("a", T0 + i, 5).allowed).toBe(true);
    }
    const denied = checkRateLimit("a", T0 + 10, 5);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.resetSeconds).toBeGreaterThan(0);
  });

  it("resets after the window and isolates clients", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("a", T0, 5);
    expect(checkRateLimit("a", T0, 5).allowed).toBe(false);
    expect(checkRateLimit("b", T0, 5).allowed).toBe(true);
    expect(checkRateLimit("a", T0 + 61_000, 5).allowed).toBe(true);
  });

  it("counts remaining down accurately", () => {
    expect(checkRateLimit("c", T0, 3).remaining).toBe(2);
    expect(checkRateLimit("c", T0 + 1, 3).remaining).toBe(1);
    expect(checkRateLimit("c", T0 + 2, 3).remaining).toBe(0);
  });
});

describe("rateLimitMax and clientKey", () => {
  it("defaults to 60, honors the env override, and relaxes in fixture mode", () => {
    expect(rateLimitMax({})).toBe(60);
    expect(rateLimitMax({ TOKENLENS_RATE_LIMIT: "10" })).toBe(10);
    expect(rateLimitMax({ TOKENLENS_DATA_MODE: "fixture" })).toBe(1000);
  });

  it("keys on the first forwarded hop", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKey({ headers })).toBe("1.2.3.4");
    expect(clientKey({ headers: new Headers() })).toBe("local");
  });
});

describe("problem responses", () => {
  it("emits RFC 9457 bodies with code, hint, and the legacy error alias", async () => {
    const res = problemResponse({
      status: 400,
      code: "invalid_params",
      title: "Bad request",
      detail: "Expected q",
      hint: "Add ?q=",
      instance: "/api/search",
      rate: { allowed: true, limit: 60, remaining: 59, resetSeconds: 30 },
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("Content-Type")).toContain("application/problem+json");
    expect(res.headers.get("X-API-Version")).toBe(API_VERSION);
    expect(res.headers.get("RateLimit-Limit")).toBe("60");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe("invalid_params");
    expect(body.status).toBe(400);
    expect(body.detail).toBe("Expected q");
    expect(body.error).toBe("Expected q");
    expect(body.hint).toBe("Add ?q=");
    expect(String(body.type)).toContain("agent-readiness");
  });

  it("429 responses carry Retry-After and the RateLimit headers", async () => {
    const res = rateLimitedResponse(
      { allowed: false, limit: 60, remaining: 0, resetSeconds: 42 },
      "/api/report",
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(res.headers.get("RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("RateLimit-Policy")).toBe("60;w=60");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe("rate_limited");
  });

  it("apiHeaders always carries the version header", () => {
    expect(apiHeaders()["X-API-Version"]).toBe(API_VERSION);
  });

  it("unknown API endpoints get a JSON 404 with recovery hints", async () => {
    const res = apiNotFoundResponse("/api/nope");
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toContain(
      "application/problem+json",
    );
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe("not_found");
    expect(String(body.hint)).toContain("/openapi.json");
    expect(body.instance).toBe("/api/nope");
  });
});
