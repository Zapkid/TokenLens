import { NextResponse } from "next/server";
import { mcpManifest } from "@/lib/agent-content";
import { siteUrl } from "@/lib/site";

export async function GET() {
  return NextResponse.json(mcpManifest(siteUrl()), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
