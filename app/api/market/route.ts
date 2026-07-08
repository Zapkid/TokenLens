import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { computeRegime } from "@/lib/report/regime";

export async function GET() {
  try {
    const snapshot = await getProvider().getMarketSnapshot();
    const regime = computeRegime(snapshot);
    return NextResponse.json({ regime, trending: snapshot.trending });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Market snapshot failed" },
      { status: 502 },
    );
  }
}
