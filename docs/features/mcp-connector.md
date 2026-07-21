# MCP connector

## Summary

TokenLens is an MCP (Model Context Protocol) server as well as a web app.
The analysis engine is exposed as five read-only tools over the streamable
HTTP transport at `/api/mcp`, so Claude (claude.ai custom connectors,
Claude Code, Claude Desktop) and any other MCP client can run token and
chain analysis conversationally: search for assets, generate scored
reports, pull scenario trajectories, compare assets, and read the market
regime.

## Entry points

- app/api/[transport]/route.ts: the MCP server. Built on the mcp-handler
  package (Vercel's adapter over the official @modelcontextprotocol/sdk),
  mounted so the streamable HTTP endpoint is `/api/mcp`. Static API routes
  (`/api/report`, `/api/search`, ...) take precedence over this dynamic
  segment, so nothing existing moves.
- lib/mcp.ts: pure projection functions that shape domain objects into
  compact LLM-facing JSON: `summarizeReportForLlm`, `summarizeScenarios`,
  `summarizeComparison`, `summarizeRegime`, plus the shared disclaimer
  constant.

Connecting a client:

- Claude Code: `claude mcp add --transport http tokenlens <origin>/api/mcp`
- claude.ai custom connector or Claude Desktop: add a remote MCP server
  with URL `<origin>/api/mcp`.

## Tools

| Tool | Wraps | Returns |
|---|---|---|
| search_assets | provider search | matching tokens and chains with the ids every other tool expects |
| generate_report | generateReport (lib/report/pipeline.ts) | scores, pillar breakdowns with inputs, metrics with cohort percentiles, risk grade and quadrant, regime, strategy framework, warnings |
| get_scenarios | the report's trajectory slice | 3, 6, and 12 month bear, base, and bull ranges with probabilities and visible modifiers; TVL scenarios for chains |
| compare_assets | generateReport per asset | per-asset score map, pillar matrix, strategy tiers for 2 to 4 assets |
| get_market_regime | getMarketSnapshot + computeRegime | regime state, composite score, components, fear and greed, trending assets |

Tool descriptions are prescriptive about when to call them (not just what
they do), because current Claude models trigger tools far more reliably
with when-to-call guidance in the description.

## Flow

1. The client POSTs JSON-RPC to `/api/mcp` (initialize, tools/list,
   tools/call). mcp-handler manages the transport and session handshake.
2. Tool handlers import lib/ functions directly: no HTTP hop, and the
   in-process 24h report cache is shared with the web UI, so repeated
   questions about the same asset are free.
3. Projections in lib/mcp.ts strip chart series (price history, TVL
   history, cohort scatter points) and keep scores, verdicts, inputs, and
   honesty markers. Every payload carries the not-financial-advice
   disclaimer and the report's warnings verbatim.

## Data touched

Nothing new is persisted. Tools read the same providers and share the same
in-process TTL cache as the REST routes. Fixture mode
(TOKENLENS_DATA_MODE=fixture) applies to MCP tools exactly as it does to
the UI, which is how the e2e suite exercises the connector
deterministically.

## Business rules / security

- Read-only surface: no tool mutates server state. There is no auth in v1
  because every tool is a query over public market data on a personal
  deployment.
- Portfolio and watchlist are intentionally unreachable: they live in the
  browser's localStorage, which this server cannot see. Exposing them
  would require moving personal state server-side plus OAuth: out of scope.
- Report generation fans out to CoinGecko and DeFiLlama on cache misses,
  so the route caps concurrent generations at 2 (queueing the rest) to
  protect free-tier API quotas from an enthusiastic agent session.
- Null pillar scores stay null in every payload. The projections never
  invent neutrality, mirroring the UI's honesty rules.

## Edge cases

- Unknown asset ids surface as isError tool results with the provider's
  message, not protocol errors, so the model can recover by calling
  search_assets.
- Schema violations (bad type enum, too few compare assets) are rejected
  by zod before any provider call.
- Chain reports without a resolvable native token carry the same warnings
  array the UI shows; the summary passes it through.
- The dynamic `[transport]` segment answers only the transport paths it
  knows; static API routes win routing precedence (verified by TL-069).

## Non-goals

Write access (watchlist, portfolio, saved shelves), auth and multi-user
scoping, MCP resources and prompts (tools only in v1), and the legacy SSE
transport (which would need a Redis backend; streamable HTTP covers
current Claude clients).

## Tests

TL-065 to TL-069 in e2e/mcp.spec.ts: handshake and tool listing, search to
report round trip, invalid argument and unknown asset handling, compare
and regime shapes, and REST route precedence. Unit coverage of the
projections lives in lib/__tests__/mcp.test.ts.
