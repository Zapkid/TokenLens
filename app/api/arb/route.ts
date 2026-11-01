import { NextResponse, type NextRequest } from "next/server";
import { getArbLive } from "@/lib/arb/live";
import { currentDataMode } from "@/lib/providers";
import {
  apiHeaders,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitedResponse,
} from "@/lib/server/api-http";

// Live data for the /arb course project page. Upstream blocks fail
// independently (listed in `errors`); only a total failure is a 502.
export async function GET(req: NextRequest) {
  const rate = checkRateLimit(clientKey(req));
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/arb");
  try {
    const live = await getArbLive(currentDataMode());
    return NextResponse.json(live, { headers: apiHeaders(rate) });
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: e instanceof Error ? e.message : "Arbitrum live data failed",
      hint: "Retry after a short delay; the static answers on /arb do not depend on this endpoint.",
      instance: "/api/arb",
      rate,
    });
  }
}
