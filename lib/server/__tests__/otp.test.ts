import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OTP_TTL_MS,
  SESSION_TTL_MS,
  _resetOtpForTests,
  mintSession,
  otpConfig,
  requestOtp,
  sendOtpEmail,
  verifyOtp,
  verifySession,
} from "../otp";

const SECRET = "unit-test-secret-0123456789abcdef";
const T0 = 1_700_000_000_000;

afterEach(() => _resetOtpForTests());

function issue(now = T0): string {
  const r = requestOtp(SECRET, now);
  if (!r.ok) throw new Error("issue failed");
  return r.code;
}

describe("otpConfig", () => {
  it("is disabled without email and secret, enabled with both", () => {
    expect(otpConfig({}).enabled).toBe(false);
    expect(
      otpConfig({
        TOKENLENS_OTP_EMAIL: "owner@example.com",
        TOKENLENS_OTP_SECRET: "short",
      }).enabled,
    ).toBe(false);
    const cfg = otpConfig({
      TOKENLENS_OTP_EMAIL: "owner@example.com",
      TOKENLENS_OTP_SECRET: SECRET,
      RESEND_API_KEY: "re_123",
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.fixture).toBe(false);
  });

  it("fixture mode is enabled with a fixed secret and no email required", () => {
    const cfg = otpConfig({
      TOKENLENS_DATA_MODE: "fixture",
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.fixture).toBe(true);
    expect(cfg.secret.length).toBeGreaterThan(16);
  });
});

describe("requestOtp and verifyOtp", () => {
  it("issues a 6 digit code that verifies exactly once", () => {
    const code = issue();
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyOtp(code, SECRET, T0 + 1000).ok).toBe(true);
    expect(verifyOtp(code, SECRET, T0 + 2000).ok).toBe(false);
  });

  it("rejects wrong codes but still accepts the right one afterward", () => {
    const code = issue();
    const wrong = code === "000000" ? "000001" : "000000";
    expect(verifyOtp(wrong, SECRET, T0 + 1000).ok).toBe(false);
    expect(verifyOtp(code, SECRET, T0 + 2000).ok).toBe(true);
  });

  it("expires codes after the TTL", () => {
    const code = issue();
    expect(verifyOtp(code, SECRET, T0 + OTP_TTL_MS + 1).ok).toBe(false);
  });

  it("supports concurrent outstanding codes without clobbering", () => {
    const a = issue(T0);
    const b = issue(T0 + 10);
    expect(verifyOtp(b, SECRET, T0 + 1000).ok).toBe(true);
    expect(verifyOtp(a, SECRET, T0 + 2000).ok).toBe(true);
  });

  it("rate limits code requests inside the window and recovers after it", () => {
    issue(T0);
    issue(T0 + 1);
    issue(T0 + 2);
    const fourth = requestOtp(SECRET, T0 + 3);
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) expect(fourth.status).toBe(429);
    expect(requestOtp(SECRET, T0 + 11 * 60_000).ok).toBe(true);
  });

  it("locks verification after repeated failures in the window", () => {
    issue();
    for (let i = 0; i < 8; i++) {
      expect(verifyOtp("999999", SECRET, T0 + i).ok).toBe(false);
    }
    const locked = verifyOtp("999999", SECRET, T0 + 100);
    expect(locked.ok).toBe(false);
    expect(locked.error).toContain("Too many attempts");
  });
});

describe("session tokens", () => {
  it("mints a token that verifies until its expiry", () => {
    const token = mintSession(SECRET, T0);
    expect(verifySession(token, SECRET, T0 + SESSION_TTL_MS - 1)).toBe(true);
    expect(verifySession(token, SECRET, T0 + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("rejects tampered, malformed, and wrong-secret tokens", () => {
    const token = mintSession(SECRET, T0);
    const [exp, sig] = token.split(".");
    expect(verifySession(`${Number(exp) + 60_000}.${sig}`, SECRET, T0)).toBe(
      false,
    );
    expect(verifySession("garbage", SECRET, T0)).toBe(false);
    expect(verifySession(undefined, SECRET, T0)).toBe(false);
    expect(verifySession(token, "another-secret-value-here", T0)).toBe(false);
  });
});

describe("sendOtpEmail", () => {
  const cfg = {
    email: "owner@example.com",
    secret: SECRET,
    resendKey: "re_test",
    fixture: false,
    enabled: true,
  };

  it("posts the code to Resend with the bearer key and recipient", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const result = await sendOtpEmail("123456", cfg, fetchMock as typeof fetch);
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer re_test",
    );
    const body = JSON.parse(String(init.body)) as {
      to: string[];
      subject: string;
    };
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.subject).toContain("123456");
  });

  it("fails cleanly without a transport key or on provider errors", async () => {
    expect((await sendOtpEmail("123456", { ...cfg, resendKey: "" })).ok).toBe(
      false,
    );
    const failing = vi.fn(async () => new Response("no", { status: 422 }));
    const result = await sendOtpEmail("123456", cfg, failing as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("422");
  });
});
