import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { computeRegime } from "@/lib/report/regime";
import {
  apiHeaders,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitedResponse,
} from "@/lib/server/api-http";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(clientKey(req));
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/market");
  try {
    const snapshot = await getProvider().getMarketSnapshot();
    const regime = computeRegime(snapshot);
    return NextResponse.json(
      { regime, trending: snapshot.trending },
      { headers: apiHeaders(rate) },
    );
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: e instanceof Error ? e.message : "Market snapshot failed",
      hint: "Retry after a short delay; upstream market data providers are rate limited.",
      instance: "/api/market",
      rate,
    });
  }
}
