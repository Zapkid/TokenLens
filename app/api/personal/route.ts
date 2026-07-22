// Personal state sync endpoint for the web UI: GET fetches the server
// document, PUT replaces it (last write wins on updatedAt). Env-gated:
// without TOKENLENS_PERSONAL_TOKEN the feature is off (501), and every
// request must carry the token as a bearer Authorization header (401).

import { NextRequest, NextResponse } from "next/server";
import {
  bearerFrom,
  getPersonalState,
  parsePersonalState,
  personalTokenConfigured,
  putPersonalState,
  verifyPersonalToken,
} from "@/lib/server/personal";

function gate(req: NextRequest): NextResponse | null {
  if (!personalTokenConfigured()) {
    return NextResponse.json(
      { error: "Personal sync is not configured on this deployment" },
      { status: 501 },
    );
  }
  if (!verifyPersonalToken(bearerFrom(req.headers.get("authorization")))) {
    return NextResponse.json({ error: "Invalid or missing token" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  try {
    return NextResponse.json({ state: await getPersonalState() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Personal state unavailable" },
      { status: 502 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const incoming = parsePersonalState(body?.state);
    const result = await putPersonalState(incoming);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    const malformed = message.startsWith("Malformed");
    return NextResponse.json({ error: message }, { status: malformed ? 400 : 502 });
  }
}
