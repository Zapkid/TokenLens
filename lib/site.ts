// Canonical site origin for metadata, sitemap, and robots. Override with
// NEXT_PUBLIC_SITE_URL when a custom domain is attached; falls back to the
// Vercel production URL at build time, then localhost for local dev.

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
