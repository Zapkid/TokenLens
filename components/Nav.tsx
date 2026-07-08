"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEL } from "@/lib/selectors";

const LINKS = [
  { href: "/", label: "Search", testId: SEL.navHome },
  { href: "/library", label: "Library", testId: SEL.navLibrary },
  { href: "/compare", label: "Compare", testId: SEL.navCompare },
  { href: "/portfolio", label: "Portfolio", testId: SEL.navPortfolio },
  { href: "/settings", label: "Settings", testId: SEL.navSettings },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="no-print sticky top-0 z-20 border-b border-hairline bg-page/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-4 flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "var(--series-1)" }}
          />
          TokenLens
        </Link>
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              data-testid={l.testId}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-surface font-medium text-ink shadow-sm"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
