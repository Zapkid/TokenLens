import { Attribution } from "@/components/Attribution";
import { Nav } from "@/components/Nav";
import { DISCLAIMER } from "@/lib/constants";

// App shell for the TokenLens product pages: nav, width-capped main column,
// and the data-attribution footer. Standalone brand pages (like /bdcc) live
// outside this route group and render full-viewport under the root layout.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        {children}
      </main>
      <footer className="no-print mx-auto max-w-6xl border-t border-hairline px-4 py-6 text-xs text-faint sm:px-6">
        <p>{DISCLAIMER}</p>
        <Attribution />
        <nav
          aria-label="Site information"
          className="mt-3 flex flex-wrap gap-x-4 gap-y-1"
        >
          <a href="/about" className="hover:underline">
            About
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/developers" className="hover:underline">
            Developers
          </a>
          <a href="/llms.txt" className="hover:underline">
            llms.txt
          </a>
          <a
            href="https://github.com/Zapkid/TokenLens"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </>
  );
}
