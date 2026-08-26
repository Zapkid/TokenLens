// Markdown content negotiation (acceptmarkdown.com) plus cache-correct
// Vary headers for every page. Requests whose Accept header lists
// text/markdown are rewritten to the markdown renderer; all page responses
// carry Vary: Accept so CDNs never serve the HTML variant to a markdown
// client or vice versa.

import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Pages only: skip Next internals, the API, and static/machine files that
  // never negotiate.
  matcher: [
    "/((?!api/|_next/|icons/|favicon\\.ico|sw\\.js|apple-touch-icon\\.png|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|llms\\.txt|openapi\\.json|\\.well-known/).*)",
  ],
};

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  if (
    (req.method === "GET" || req.method === "HEAD") &&
    accept.includes("text/markdown")
  ) {
    const target = new URL(
      `/api/markdown?path=${encodeURIComponent(req.nextUrl.pathname)}`,
      req.url,
    );
    // The original path also travels as a request header: rewrite handling
    // can strip query params, and the header survives regardless.
    const headers = new Headers(req.headers);
    headers.set("x-markdown-path", req.nextUrl.pathname);
    return NextResponse.rewrite(target, { request: { headers } });
  }
  const res = NextResponse.next();
  res.headers.append("Vary", "Accept");
  return res;
}
