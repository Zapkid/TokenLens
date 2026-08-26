import type { NextConfig } from "next";

// Security headers for every route. A strict CSP is deliberately not set:
// the ad and analytics tags this site is prepared for (gtag, GTM, Meta and X
// pixels) load evolving third-party script sets that an enforced CSP would
// silently break; the remaining headers cover clickjacking, MIME sniffing,
// referrer leakage, and powerful-feature lockdown. Vercel adds HSTS.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "icons.llama.fi" },
      // BDCC landing gallery; served through the Next image optimizer so
      // visitors load them from our own domain (cached, resized, no
      // hotlink referrer issues).
      { protocol: "https", hostname: "lwfiles.mycourse.app" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
