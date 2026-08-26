import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/agent-content";
import { siteUrl } from "@/lib/site";

export async function GET() {
  return NextResponse.json(openApiSpec(siteUrl()), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
