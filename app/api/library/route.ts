import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { LIBRARY_TTL_MS } from "@/lib/constants";
import { currentDataMode, getProvider } from "@/lib/providers";
import {
  apiHeaders,
  checkRateLimit,
  clientKey,
  problemResponse,
  rateLimitedResponse,
} from "@/lib/server/api-http";
import type { Library } from "@/lib/types";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(clientKey(req));
  if (!rate.allowed) return rateLimitedResponse(rate, "/api/library");
  try {
    const library = await cached<Library>(
      `library:${currentDataMode()}`,
      LIBRARY_TTL_MS,
      async () => {
        const provider = getProvider();
        const [tokens, chains] = await Promise.all([
          provider.getTopTokens(10),
          provider.getTopChains(10),
        ]);
        return {
          tokens,
          chains,
          asOf: new Date().toISOString(),
          dataMode: currentDataMode(),
        };
      },
    );
    return NextResponse.json({ library }, { headers: apiHeaders(rate) });
  } catch (e) {
    return problemResponse({
      status: 502,
      code: "upstream_unavailable",
      title: "Upstream data provider failed",
      detail: e instanceof Error ? e.message : "Library fetch failed",
      hint: "Retry after a short delay; upstream market data providers are rate limited.",
      instance: "/api/library",
      rate,
    });
  }
}
