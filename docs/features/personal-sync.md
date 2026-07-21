# Personal sync and MCP personal tools

## Summary

Watchlist, portfolio positions, and asset tiers can now live in two places
that stay converged: the browser's localStorage (always, the UI's source
of truth) and an optional server-side personal store. When the deployment
configures a personal token, the web app mirrors local state to the
server and the MCP connector gains six personal tools, so Claude can read
the watchlist, value the portfolio, and record or remove positions, with
changes flowing back into the UI.

## Entry points

- lib/server/personal.ts: the server store and auth. One state document
  (schemaVersion, watchlist, positions, assetTiers, updatedAt), backend
  chosen at call time: in-memory in fixture mode, Upstash Redis REST when
  UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set (needed for
  persistence on Vercel), otherwise a JSON file under TOKENLENS_DATA_DIR
  (default .data/).
- app/api/personal/route.ts: GET and PUT for the web UI sync loop.
- app/api/[transport]/route.ts: the six MCP personal tools plus the
  withMcpAuth wrapper that verifies the bearer token.
- lib/personal-sync.ts and components/PersonalSync.tsx: the client half,
  mounted in the root layout.
- app/settings/page.tsx: the Personal sync section where the user pastes
  the token (stored in localStorage, empty means sync off).

## Configuration

1. Set TOKENLENS_PERSONAL_TOKEN on the deployment (any long random
   string). Without it the personal surface does not exist: the REST
   route answers 501 and the MCP personal tools are not registered.
2. On Vercel, also set the two Upstash variables; serverless filesystems
   are ephemeral, so the file backend only persists on local or
   self-hosted deployments.
3. Paste the same token into Settings, Personal sync, on each browser
   that should participate.
4. MCP clients send the token as an Authorization bearer header, for
   example: claude mcp add --transport http tokenlens <origin>/api/mcp
   --header "Authorization: Bearer <token>". claude.ai custom connectors
   cannot send static headers, so personal tools are for Claude Code and
   Claude Desktop today; the analysis tools remain public.

## Flow

1. Local mutations (watchlist toggle, position form, tier writes) bump a
   local updatedAt and, when a token is configured, debounce a push of
   the whole document to PUT /api/personal.
2. On load and once a minute, the client reconciles: whichever side has
   the newer updatedAt wins, whole document (last write wins). A stale
   push is rejected by the server, which returns its newer document so
   the client converges.
3. MCP personal tools mutate the server document directly with a fresh
   updatedAt; the browser picks the change up on its next reconcile.
4. get_portfolio reuses the same tested analyzePortfolio function as the
   portfolio page, valued with live quotes, and reports per-lot and total
   P&L. Totals are withheld (null) when any position is unpriced.

## Data touched

The personal state document, stored in memory (fixture), a local JSON
file, or Upstash. Browser localStorage keys watchlist, positions,
assetTiers, personalUpdatedAt, and personalToken. No schema migrations:
the document carries schemaVersion 1 and is validated on every write.

## Business rules / security

- Env-gated: no TOKENLENS_PERSONAL_TOKEN, no personal surface at all.
- Token comparison is constant time (sha256 then timingSafeEqual).
- The REST route requires the bearer token on every request (401
  otherwise). The MCP handler verifies tokens via withMcpAuth with
  required false, so public analysis tools stay anonymous while every
  personal tool checks for verified authInfo and errors without it.
- The token is a personal secret for a single-user deployment. It is
  stored in the browser's localStorage by explicit user action, like the
  personal state it protects. There is no multi-user scoping.
- remove_position's description tells the model to confirm with the user
  first: it deletes every lot of an asset and is not undoable.

## Edge cases

- Sync while offline: fetch failures are swallowed; localStorage remains
  authoritative and the next successful reconcile converges.
- Concurrent edits (browser and MCP in the same window): whole-document
  last write wins; the losing write is dropped by design, documented
  here rather than hidden behind a merge that could interleave state.
- Two lots of the same asset are listed separately everywhere;
  remove_position clears all of them at once.
- A pulled server document overwrites local state only when strictly
  newer; equal timestamps are a no-op.

## Non-goals

Multi-user accounts, OAuth, per-field merge resolution, syncing saved
reports or weights (they stay local), and exposing the personal REST API
to third parties (it exists for the app's own sync loop).

## Tests

TL-070 to TL-075 in e2e/personal.spec.ts: REST auth gate, last write
wins, MCP personal tool listing and auth refusal, watchlist and portfolio
round trips over real JSON-RPC, and the UI pull loop. Unit suites:
lib/server/__tests__/personal.test.ts (auth, validation, store, LWW,
domain mutations) and lib/__tests__/personal-sync.test.ts (reconcile
decisions), plus portfolio and watchlist projections in
lib/__tests__/mcp.test.ts.
