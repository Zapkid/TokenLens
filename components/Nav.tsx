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
      <nav className="scrollbar-none mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="mr-2 flex shrink-0 items-center gap-2 font-semibold sm:mr-4"
        >
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
              className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
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
