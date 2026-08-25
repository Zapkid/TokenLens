// OTP-session-gated proxy for CoinGecko onchain DEX analytics. The CoinGecko
// key stays server-side; without a valid session cookie no outbound API
// request is made.

import { NextRequest, NextResponse } from "next/server";
import {
  fetchTrendingPools,
  fixtureTrendingPools,
  isOnchainNetwork,
} from "@/lib/onchain";
import { OTP_COOKIE, otpConfig, verifySession } from "@/lib/server/otp";

export async function GET(req: NextRequest) {
  const cfg = otpConfig();
  if (!cfg.enabled) {
    return NextResponse.json(
      {
        error:
          "Onchain analytics is not configured. Set TOKENLENS_OTP_EMAIL and TOKENLENS_OTP_SECRET.",
      },
      { status: 503 },
    );
  }
  if (!verifySession(req.cookies.get(OTP_COOKIE)?.value, cfg.secret)) {
    return NextResponse.json(
      { error: "Verification required" },
      { status: 401 },
    );
  }
  const network = req.nextUrl.searchParams.get("network") ?? "eth";
  if (!isOnchainNetwork(network)) {
    return NextResponse.json({ error: "Unknown network" }, { status: 400 });
  }
  if (cfg.fixture) {
    return NextResponse.json({ network, pools: fixtureTrendingPools(network) });
  }
  if (!process.env.COINGECKO_API_KEY) {
    return NextResponse.json(
      { error: "COINGECKO_API_KEY is not set." },
      { status: 503 },
    );
  }
  try {
    const pools = await fetchTrendingPools(network);
    return NextResponse.json({ network, pools });
  } catch {
    return NextResponse.json(
      { error: "CoinGecko onchain request failed." },
      { status: 502 },
    );
  }
}
