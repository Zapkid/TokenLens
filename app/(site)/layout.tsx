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
      </footer>
    </>
  );
}
