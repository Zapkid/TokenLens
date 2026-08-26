import Link from "next/link";

// Root 404: a short recovery page so both people and agents know where to
// look next. Next serves this with a real HTTP 404 status. Clients asking
// for text/markdown get the markdown equivalent via the middleware rewrite.
export default function NotFound() {
  const places = [
    { href: "/", label: "Home: search any token or chain" },
    { href: "/library", label: "Library: top tokens and chains" },
    { href: "/developers", label: "Developer guide: REST API and MCP server" },
    { href: "/llms.txt", label: "llms.txt: what this site is and when to use it" },
    { href: "/sitemap.xml", label: "Sitemap: every indexable page" },
    { href: "/openapi.json", label: "OpenAPI description of the public API" },
    { href: "/about", label: "About TokenLens" },
  ];
  return (
    <main className="mx-auto max-w-md px-4 pt-16 pb-16">
      <h1 className="text-2xl font-bold">404: page not found</h1>
      <p className="mt-2 text-sm text-ink-2">
        There is no page at this address. Places to look next:
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {places.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="underline">
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-faint">
        Agents: request any page with Accept: text/markdown for a markdown
        rendition, and see /llms.txt for when to use TokenLens.
      </p>
    </main>
  );
}
