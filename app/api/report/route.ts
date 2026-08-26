import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/report/pipeline";
import {
  apiHeaders,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitedResponse,
} from "@/lib/server/api-http";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(clientKey(req));
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/report");
  const params = req.nextUrl.searchParams;
  const type = params.get("type");
  const id = params.get("id");
  const refresh = params.get("refresh") === "1";
  if ((type !== "token" && type !== "chain") || !id) {
    return problemResponse({
      status: 400,
      code: "invalid_params",
      title: "Missing or invalid parameters",
      detail: "Expected type=token|chain and id.",
      hint: "Resolve the id first with GET /api/search?q=<name>; type is 'token' for coins and 'chain' for blockchains.",
      instance: "/api/report",
      rate,
    });
  }
  try {
    const report = await generateReport(type, id, { refresh });
    return NextResponse.json({ report }, { headers: apiHeaders(rate) });
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "report_failed",
      title: "Report generation failed",
      detail: e instanceof Error ? e.message : "Report generation failed",
      hint: "Check that the id came from /api/search; unknown assets are rejected rather than fabricated. Upstream providers may also be temporarily unavailable.",
      instance: "/api/report",
      rate,
    });
  }
}
