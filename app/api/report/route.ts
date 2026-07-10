import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/report/pipeline";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const type = params.get("type");
  const id = params.get("id");
  const refresh = params.get("refresh") === "1";
  if ((type !== "token" && type !== "chain") || !id) {
    return NextResponse.json(
      { error: "Expected type=token|chain and id" },
      { status: 400 },
    );
  }
  try {
    const report = await generateReport(type, id, { refresh });
    return NextResponse.json({ report });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Report generation failed" },
      { status: 502 },
    );
  }
}
