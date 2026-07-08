import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "TokenLens",
  description:
    "On-demand crypto token and blockchain analysis: scores, risk, scenarios, and strategy from public data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          {children}
        </main>
        <footer className="no-print mx-auto max-w-6xl border-t border-hairline px-4 py-6 text-xs text-faint sm:px-6">
          <p>{DISCLAIMER}</p>
          <p className="mt-2">
            Market data by CoinGecko. TVL data by DeFiLlama. Fear and Greed by
            alternative.me.
          </p>
        </footer>
      </body>
    </html>
  );
}
