// Email OTP endpoints for the onchain analytics gate. GET reports session
// state; POST {action:"request"} emails a code, POST {action:"verify", code}
// exchanges a correct code for a 10 minute httpOnly session cookie.
// In fixture mode no email is sent and the code is returned to the caller
// (test-only behavior; fixture mode must never run in production).

import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(
      {
        error:
          "OTP gate not configured. Set TOKENLENS_OTP_EMAIL and TOKENLENS_OTP_SECRET.",
      },
      { status: 503 },
    );
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
      return NextResponse.json({ error: issued.error }, { status: issued.status });
    }
    if (cfg.fixture) {
      return NextResponse.json({ ok: true, devCode: issued.code });
    }
    const sent = await sendOtpEmail(issued.code, cfg);
    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "verify") {
    const result = verifyOtp(String(body.code ?? ""), cfg.secret);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
