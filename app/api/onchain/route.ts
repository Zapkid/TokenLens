// OTP-session-gated proxy for CoinGecko onchain DEX analytics. The CoinGecko
// key stays server-side; without a valid session cookie no outbound API
// request is made. Errors follow the site-wide RFC 9457 problem+json shape.

import { NextRequest, NextResponse } from "next/server";
import {
  fetchTrendingPools,
  fixtureTrendingPools,
  isOnchainNetwork,
} from "@/lib/onchain";
import { problemResponse } from "@/lib/server/api-http";
import { OTP_COOKIE, otpConfig, verifySession } from "@/lib/server/otp";

export async function GET(req: NextRequest) {
  const cfg = otpConfig();
  if (!cfg.enabled) {
    return problemResponse({
      status: 503,
      code: "not_configured",
      title: "Onchain analytics is not configured",
      detail:
        "Onchain analytics is not configured. Set TOKENLENS_OTP_EMAIL and TOKENLENS_OTP_SECRET.",
      hint: "This surface is owner-gated; see docs/features/onchain-analytics.md.",
      instance: "/api/onchain",
    });
  }
  if (!verifySession(req.cookies.get(OTP_COOKIE)?.value, cfg.secret)) {
    return problemResponse({
      status: 401,
      code: "verification_required",
      title: "Verification required",
      detail: "Verification required",
      hint: "Request an email code via POST /api/otp {action:'request'}, verify it, then retry within the 10 minute session.",
      instance: "/api/onchain",
    });
  }
  const network = req.nextUrl.searchParams.get("network") ?? "eth";
  if (!isOnchainNetwork(network)) {
    return problemResponse({
      status: 400,
      code: "invalid_params",
      title: "Unknown network",
      detail: "Unknown network",
      hint: "Supported networks: eth, solana, bsc, base, arbitrum.",
      instance: "/api/onchain",
    });
  }
  if (cfg.fixture) {
    return NextResponse.json({ network, pools: fixtureTrendingPools(network) });
  }
  if (!process.env.COINGECKO_API_KEY) {
    return problemResponse({
      status: 503,
      code: "not_configured",
      title: "CoinGecko key missing",
      detail: "COINGECKO_API_KEY is not set.",
      hint: "The site owner must configure the CoinGecko API key server-side.",
      instance: "/api/onchain",
    });
  }
  try {
    const pools = await fetchTrendingPools(network);
    return NextResponse.json({ network, pools });
  } catch {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: "CoinGecko onchain request failed.",
      hint: "Retry after a short delay.",
      instance: "/api/onchain",
    });
  }
}
