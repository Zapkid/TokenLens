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
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/prices");
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (ids.length === 0) {
    return problemResponse({
      status: 400,
      code: "invalid_params",
      title: "Missing ids parameter",
      detail: "Provide ids as a comma-separated list of TokenLens asset ids.",
      hint: "Resolve ids first with GET /api/search?q=<name>.",
      instance: "/api/prices",
      rate,
    });
  }
  try {
    const quotes = await getProvider().getPrices(ids);
    return NextResponse.json({ quotes }, { headers: apiHeaders(rate) });
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: e instanceof Error ? e.message : "Price fetch failed",
      hint: "Retry after a short delay; upstream market data providers are rate limited.",
      instance: "/api/prices",
      rate,
    });
  }
}
