import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }
  try {
    const results = await getProvider().search(q);
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Search failed" },
      { status: 502 },
    );
  }
}
