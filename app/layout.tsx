import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChunkReload } from "@/components/ChunkReload";
import { PersonalSync } from "@/components/PersonalSync";
import { PwaRegister } from "@/components/PwaRegister";

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

// Root layout carries only the document shell and app-wide clients. The
// TokenLens nav, capped main column, and footer live in app/(site)/layout.tsx
// so standalone pages (like /bdcc) can use the full viewport.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ChunkReload />
        <PwaRegister />
        <PersonalSync />
        {children}
      </body>
    </html>
  );
}
