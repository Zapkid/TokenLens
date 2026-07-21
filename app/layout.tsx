import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { PersonalSync } from "@/components/PersonalSync";
import { PwaRegister } from "@/components/PwaRegister";
import { DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "TokenLens",
  description:
    "On-demand crypto token and blockchain analysis: scores, risk, scenarios, and strategy from public data.",
  applicationName: "TokenLens",
  appleWebApp: {
    capable: true,
    title: "TokenLens",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <PwaRegister />
        <PersonalSync />
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
