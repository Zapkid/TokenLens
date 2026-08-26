// Catch-all for unknown nested API paths: agents get an RFC 9457 JSON 404
// with recovery hints instead of the HTML not-found page.

import { NextRequest } from "next/server";
import { apiNotFoundResponse } from "@/lib/server/api-http";

function notFound(req: NextRequest) {
  return apiNotFoundResponse(req.nextUrl.pathname);
}

export {
  notFound as GET,
  notFound as POST,
  notFound as PUT,
  notFound as PATCH,
  notFound as DELETE,
};
