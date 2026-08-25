// Email OTP gate for outbound CoinGecko API usage on /onchain.
//
// Flow: the owner requests a 6-digit code, it is emailed to the configured
// address (Resend), and verifying it mints a 10 minute HMAC-signed session
// cookie. While the session is valid, onchain API routes may call out to
// CoinGecko without further codes.
//
// Env (server-side only, never NEXT_PUBLIC):
// - TOKENLENS_OTP_EMAIL: recipient address for codes. Unset disables the gate.
// - TOKENLENS_OTP_SECRET: long random secret; hashes codes and signs sessions.
// - RESEND_API_KEY: Resend key used to deliver the email.
// In fixture mode (TOKENLENS_DATA_MODE=fixture) no email is sent and the
// request endpoint returns the code for tests; a fixed secret keeps the
// session flow testable. Fixture mode must never be enabled in production.
//
// State is in-memory per server instance (fine for a single-region personal
// deployment; a second instance would just ask for a fresh code).

import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 5 * 60_000;
export const SESSION_TTL_MS = 10 * 60_000;
export const OTP_COOKIE = "tl_otp_session";
const MAX_REQUESTS_PER_WINDOW = 3;
const REQUEST_WINDOW_MS = 10 * 60_000;
const FIXTURE_SECRET = "tokenlens-fixture-otp-secret";

// Outstanding code hashes with expiry. A small map (not a single slot) so
// concurrent requests cannot silently invalidate each other's codes.
const pendingCodes = new Map<string, number>();
let requestTimes: number[] = [];
let failedAttempts: number[] = [];
const MAX_FAILED_ATTEMPTS_PER_WINDOW = 8;

export interface OtpConfig {
  email: string;
  secret: string;
  resendKey: string;
  fixture: boolean;
  enabled: boolean;
}

export function otpConfig(
  env: Record<string, string | undefined> = process.env,
): OtpConfig {
  const fixture = env.TOKENLENS_DATA_MODE === "fixture";
  const email = (env.TOKENLENS_OTP_EMAIL ?? "").trim();
  const secret = fixture
    ? FIXTURE_SECRET
    : (env.TOKENLENS_OTP_SECRET ?? "").trim();
  return {
    email,
    secret,
    resendKey: (env.RESEND_API_KEY ?? "").trim(),
    fixture,
    enabled: fixture || (email.length > 0 && secret.length >= 16),
  };
}

function hashCode(code: string, secret: string): string {
  return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}

/** Issue a new code, enforcing the request rate limit (relaxed in fixture
 * mode so parallel e2e workers cannot starve each other). The caller is
 * responsible for delivering it (email, or the fixture-mode response). */
export function requestOtp(
  secret: string,
  now: number = Date.now(),
  maxRequests: number = MAX_REQUESTS_PER_WINDOW,
): { ok: true; code: string } | { ok: false; error: string; status: number } {
  requestTimes = requestTimes.filter((t) => now - t < REQUEST_WINDOW_MS);
  if (requestTimes.length >= maxRequests) {
    return {
      ok: false,
      error: "Too many code requests. Try again in a few minutes.",
      status: 429,
    };
  }
  requestTimes.push(now);
  for (const [hash, expiresAt] of pendingCodes) {
    if (now > expiresAt) pendingCodes.delete(hash);
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  pendingCodes.set(hashCode(code, secret), now + OTP_TTL_MS);
  return { ok: true, code };
}

/** Verify a code against the outstanding set. Codes are stored only as
 * secret-salted hashes and consumed on success; failed attempts are rate
 * limited across the window to block brute force. */
export function verifyOtp(
  code: string,
  secret: string,
  now: number = Date.now(),
): { ok: boolean; error?: string } {
  failedAttempts = failedAttempts.filter((t) => now - t < REQUEST_WINDOW_MS);
  if (failedAttempts.length >= MAX_FAILED_ATTEMPTS_PER_WINDOW) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }
  if (!/^\d{6}$/.test(code)) {
    failedAttempts.push(now);
    return { ok: false, error: "Enter the 6 digit code." };
  }
  const hash = hashCode(code, secret);
  const expiresAt = pendingCodes.get(hash);
  if (expiresAt === undefined || now > expiresAt) {
    if (expiresAt !== undefined) pendingCodes.delete(hash);
    failedAttempts.push(now);
    return { ok: false, error: "Wrong or expired code. Request a new one." };
  }
  pendingCodes.delete(hash);
  return { ok: true };
}

function sessionSig(expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`otp-session:${expiresAt}`).digest("hex");
}

/** Session token: "<expiryMs>.<hmac>". Stateless, so it survives instance
 * recycling for its 10 minute lifetime. */
export function mintSession(secret: string, now: number = Date.now()): string {
  const expiresAt = now + SESSION_TTL_MS;
  return `${expiresAt}.${sessionSig(expiresAt, secret)}`;
}

export function verifySession(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  if (!Number.isFinite(expiresAt) || now > expiresAt) return false;
  const given = token.slice(dot + 1);
  const expected = sessionSig(expiresAt, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Deliver the code with Resend. The from address works out of the box for
 * the account owner's inbox; move to a verified domain for anything else. */
export async function sendOtpEmail(
  code: string,
  cfg: OtpConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; error?: string }> {
  if (!cfg.resendKey) {
    return {
      ok: false,
      error: "Email transport not configured (RESEND_API_KEY).",
    };
  }
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TokenLens <onboarding@resend.dev>",
      to: [cfg.email],
      subject: `TokenLens verification code: ${code}`,
      text: `Your TokenLens onchain analytics code is ${code}. It expires in 5 minutes. If you did not request it, ignore this email.`,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `Email send failed (${res.status}).` };
  }
  return { ok: true };
}

export function _resetOtpForTests() {
  pendingCodes.clear();
  requestTimes = [];
  failedAttempts = [];
}
