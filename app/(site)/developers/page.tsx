import Link from "next/link";
import { Card } from "@/components/ui";
import { MCP_PUBLIC_TOOLS } from "@/lib/agent-content";

export const metadata = {
  title: "Developers · TokenLens",
  description:
    "TokenLens developer guide: public REST API endpoints, the MCP server for AI agents, and machine-readable descriptions.",
  alternates: { canonical: "/developers" },
};

const endpoints = [
  ["GET /api/search?q=<query>", "Resolve tokens and chains to TokenLens ids"],
  ["GET /api/report?type=token|chain&id=<id>", "Full analysis report for one asset"],
  ["GET /api/library", "Top tokens by market cap and chains by TVL"],
  ["GET /api/market", "Global market regime snapshot"],
  ["GET /api/prices?ids=<id,id>", "Quotes for known asset ids"],
];

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">TokenLens for developers and agents</h1>
      <Card>
        <h2 className="font-semibold">REST API</h2>
        <p className="mt-2 text-sm text-ink-2">
          Public, read-only, no authentication. Responses are JSON. A
          machine-readable description lives at{" "}
          <a href="/openapi.json" className="underline">
            /openapi.json
          </a>
          . Please keep request rates modest: upstream data comes from
          free-tier providers.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {endpoints.map(([sig, desc]) => (
            <li key={sig}>
              <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{sig}</code>
              <span className="ms-2 text-ink-2">{desc}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-semibold">MCP server (for AI agents)</h2>
        <p className="mt-2 text-sm text-ink-2">
          TokenLens doubles as a Model Context Protocol server over Streamable
          HTTP at <code className="rounded bg-surface px-1.5 py-0.5 text-xs">/api/mcp</code>.
          Add it to Claude or any MCP client as a custom connector with that
          URL. The handshake manifest is published at{" "}
          <a href="/.well-known/mcp" className="underline">
            /.well-known/mcp
          </a>
          . Resolve asset ids with search_assets before calling the other
          tools.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
          {MCP_PUBLIC_TOOLS.map((t) => (
            <li key={t.name}>
              <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{t.name}</code>
              <span className="ms-2">{t.description}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-2">
          Six additional personal tools (watchlist and portfolio) exist but
          require the owner&apos;s bearer token.
        </p>
      </Card>
      <Card>
        <h2 className="font-semibold">Machine-readable surfaces</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm text-ink-2">
          <li>
            <a href="/llms.txt" className="underline">/llms.txt</a>: what
            TokenLens is and when an agent should use it
          </li>
          <li>
            Markdown negotiation: request any page with{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-xs">Accept: text/markdown</code>{" "}
            to get a markdown rendition
          </li>
          <li>
            <a href="/sitemap.xml" className="underline">/sitemap.xml</a> and{" "}
            <a href="/robots.txt" className="underline">/robots.txt</a>
          </li>
          <li>
            Source, docs, and test plans:{" "}
            <a
              href="https://github.com/Zapkid/TokenLens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              github.com/Zapkid/TokenLens
            </a>
          </li>
        </ul>
        <p className="mt-3 text-sm text-ink-2">
          Scoring definitions are on the{" "}
          <Link href="/methodology" className="underline">
            methodology page
          </Link>
          . TokenLens is decision support for personal use, not financial
          advice.
        </p>
      </Card>
    </div>
  );
}
