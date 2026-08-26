// Email OTP endpoints for the onchain analytics gate. GET reports session
// state; POST {action:"request"} emails a code, POST {action:"verify", code}
// exchanges a correct code for a 10 minute httpOnly session cookie.
// In fixture mode no email is sent and the code is returned to the caller
// (test-only behavior; fixture mode must never run in production).

import { NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/server/api-http";
import {
  OTP_COOKIE,
  SESSION_TTL_MS,
  mintSession,
  otpConfig,
  requestOtp,
  sendOtpEmail,
  verifyOtp,
  verifySession,
} from "@/lib/server/otp";

export async function GET(req: NextRequest) {
  const cfg = otpConfig();
  const authenticated =
    cfg.enabled && verifySession(req.cookies.get(OTP_COOKIE)?.value, cfg.secret);
  return NextResponse.json({ enabled: cfg.enabled, authenticated });
}

export async function POST(req: NextRequest) {
  const cfg = otpConfig();
  if (!cfg.enabled) {
    return problemResponse({
      status: 503,
      code: "not_configured",
      title: "OTP gate not configured",
      detail:
        "OTP gate not configured. Set TOKENLENS_OTP_EMAIL and TOKENLENS_OTP_SECRET.",
      hint: "This surface is owner-gated; see docs/features/onchain-analytics.md.",
      instance: "/api/otp",
    });
  }
  let body: { action?: string; code?: unknown } | null = null;
  try {
    body = (await req.json()) as { action?: string; code?: unknown };
  } catch {
    body = null;
  }

  if (body?.action === "request") {
    // Fixture e2e runs many parallel workers; the strict limit is for prod.
    const issued = requestOtp(cfg.secret, Date.now(), cfg.fixture ? 50 : 3);
    if (!issued.ok) {
      return problemResponse({
        status: issued.status,
        code: issued.status === 429 ? "rate_limited" : "otp_request_failed",
        title: "Code request refused",
        detail: issued.error,
        hint: "Wait a few minutes before requesting another code.",
        instance: "/api/otp",
        retryAfterSeconds: issued.status === 429 ? 300 : undefined,
      });
    }
    if (cfg.fixture) {
      return NextResponse.json({ ok: true, devCode: issued.code });
    }
    const sent = await sendOtpEmail(issued.code, cfg);
    if (!sent.ok) {
      return problemResponse({
        status: 503,
        code: "email_failed",
        title: "Could not send the code",
        detail: sent.error ?? "Email send failed.",
        hint: "Check the RESEND_API_KEY server configuration, then retry.",
        instance: "/api/otp",
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "verify") {
    const result = verifyOtp(String(body.code ?? ""), cfg.secret);
    if (!result.ok) {
      return problemResponse({
        status: 401,
        code: "invalid_code",
        title: "Verification failed",
        detail: result.error ?? "Verification failed.",
        hint: "Enter the exact 6 digit code from the email; request a new one if it expired.",
        instance: "/api/otp",
      });
    }
    const res = NextResponse.json({
      ok: true,
      ttlSeconds: SESSION_TTL_MS / 1000,
    });
    res.cookies.set(OTP_COOKIE, mintSession(cfg.secret), {
      httpOnly: true,
      sameSite: "strict",
      // Fixture e2e runs over plain http on 127.0.0.1.
      secure: process.env.NODE_ENV === "production" && !cfg.fixture,
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return res;
  }

  return problemResponse({
    status: 400,
    code: "invalid_params",
    title: "Unknown action",
    detail: "Unknown action",
    hint: "POST {action:'request'} to get a code or {action:'verify', code} to redeem it.",
    instance: "/api/otp",
  });
}
