// Markdown renderer behind the Accept: text/markdown middleware rewrite
// (acceptmarkdown.com). Known pages return their markdown rendition; unknown
// paths return a markdown 404 with recovery links.

import { NextRequest, NextResponse } from "next/server";
import { markdownForPath } from "@/lib/agent-content";
import { siteUrl } from "@/lib/site";

export async function GET(req: NextRequest) {
  // The middleware rewrite carries the original path in a header (query
  // params can be stripped in rewrite handling); direct calls may use the
  // query param. Missing both is treated as unknown, never a soft 200.
  const path =
    req.headers.get("x-markdown-path") ?? req.nextUrl.searchParams.get("path");
  const { found, markdown } = markdownForPath(path ?? "/__missing__", siteUrl());
  return new NextResponse(markdown, {
    status: found ? 200 : 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "public, max-age=300",
    },
  });
}
