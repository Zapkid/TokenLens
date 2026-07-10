import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  try {
    const quotes = await getProvider().getPrices(ids);
    return NextResponse.json({ quotes });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Price fetch failed" },
      { status: 502 },
    );
  }
}
