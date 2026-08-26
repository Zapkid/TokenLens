import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import {
  apiHeaders,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitedResponse,
} from "@/lib/server/api-http";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(clientKey(req));
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/search");
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json({ results: [] }, { headers: apiHeaders(rate) });
  }
  try {
    const results = await getProvider().search(q);
    return NextResponse.json({ results }, { headers: apiHeaders(rate) });
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: e instanceof Error ? e.message : "Search failed",
      hint: "Retry after a short delay; upstream market data providers are rate limited.",
      instance: "/api/search",
      rate,
    });
  }
}
