import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { LIBRARY_TTL_MS } from "@/lib/constants";
import { currentDataMode, getProvider } from "@/lib/providers";
import type { Library } from "@/lib/types";

export async function GET() {
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
    return NextResponse.json({ library });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Library fetch failed" },
      { status: 502 },
    );
  }
}
