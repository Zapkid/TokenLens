// Shared HTTP conventions for the public TokenLens API: RFC 9457
// application/problem+json errors, IETF RateLimit headers with a simple
// fixed-window limiter, and the API version header. Documented in
// /openapi.json and on /developers.

import { NextResponse } from "next/server";

export const API_VERSION = "1";
export const API_VERSION_HEADER = "X-API-Version";

// Fixed-window per-client limit. In-memory per server instance (documented
// as best effort on serverless). Fixture/e2e runs raise the limit so
// parallel tests never trip it; unit tests exercise the 429 path directly.
export const RATE_WINDOW_SECONDS = 60;

export function rateLimitMax(env: Record<string, string | undefined> = process.env): number {
  const configured = Number(env.TOKENLENS_RATE_LIMIT);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return env.TOKENLENS_DATA_MODE === "fixture" ? 1000 : 60;
}

interface WindowState {
  windowStart: number;
  count: number;
}

const windows = new Map<string, WindowState>();

export interface RateResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window resets. */
  resetSeconds: number;
}

export function checkRateLimit(
  key: string,
  now: number = Date.now(),
  limit: number = rateLimitMax(),
): RateResult {
  const windowMs = RATE_WINDOW_SECONDS * 1000;
  const state = windows.get(key);
  if (!state || now - state.windowStart >= windowMs) {
    windows.set(key, { windowStart: now, count: 1 });
    return { allowed: true, limit, remaining: limit - 1, resetSeconds: RATE_WINDOW_SECONDS };
  }
  const resetSeconds = Math.max(1, Math.ceil((state.windowStart + windowMs - now) / 1000));
  if (state.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetSeconds };
  }
  state.count += 1;
  return { allowed: true, limit, remaining: limit - state.count, resetSeconds };
}

/** Client key: first hop of x-forwarded-for, or a shared bucket locally. */
export function clientKey(req: { headers: { get(name: string): string | null } }): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}

/** Standard headers for every public API response, success or error. */
export function apiHeaders(rate?: RateResult): Record<string, string> {
  const headers: Record<string, string> = { [API_VERSION_HEADER]: API_VERSION };
  if (rate) {
    headers["RateLimit-Limit"] = String(rate.limit);
    headers["RateLimit-Remaining"] = String(rate.remaining);
    headers["RateLimit-Reset"] = String(rate.resetSeconds);
    headers["RateLimit-Policy"] = `${rate.limit};w=${RATE_WINDOW_SECONDS}`;
  }
  return headers;
}

export interface ProblemInput {
  status: number;
  /** Stable machine-readable code, e.g. "invalid_params". */
  code: string;
  title: string;
  detail: string;
  /** What the caller should do about it. */
  hint?: string;
  instance?: string;
  rate?: RateResult;
  retryAfterSeconds?: number;
}

/** RFC 9457 problem details. `code`, `hint`, and the legacy `error` alias
 * (mirroring detail) are extension members. */
export function problemResponse(input: ProblemInput): NextResponse {
  const headers: Record<string, string> = {
    ...apiHeaders(input.rate),
    "Content-Type": "application/problem+json",
  };
  if (input.retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(input.retryAfterSeconds);
  }
  const body: Record<string, unknown> = {
    type: `https://github.com/Zapkid/TokenLens/blob/main/docs/features/agent-readiness.md#${input.code}`,
    title: input.title,
    status: input.status,
    code: input.code,
    detail: input.detail,
    error: input.detail,
  };
  if (input.hint) body.hint = input.hint;
  if (input.instance) body.instance = input.instance;
  return NextResponse.json(body, { status: input.status, headers });
}

/** JSON 404 for unknown API paths, so agents never get an HTML error page. */
export function apiNotFoundResponse(instance: string): NextResponse {
  return problemResponse({
    status: 404,
    code: "not_found",
    title: "Unknown API endpoint",
    detail: `There is no API endpoint at ${instance}.`,
    hint: "Public endpoints: /api/search, /api/report, /api/library, /api/market, /api/prices. Full description: /openapi.json. MCP server: /api/mcp.",
    instance,
  });
}

/** 429 for an exhausted window. */
export function rateLimitedResponse(rate: RateResult, instance?: string): NextResponse {
  return problemResponse({
    status: 429,
    code: "rate_limited",
    title: "Too many requests",
    detail: `Rate limit of ${rate.limit} requests per ${RATE_WINDOW_SECONDS}s exceeded.`,
    hint: `Wait Retry-After seconds, then resume. Self-throttle using the RateLimit-Remaining and RateLimit-Reset response headers.`,
    instance,
    rate,
    retryAfterSeconds: rate.resetSeconds,
  });
}

export function _resetRateLimitForTests() {
  windows.clear();
}
