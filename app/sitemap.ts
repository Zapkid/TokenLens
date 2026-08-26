import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const routes = [
    "",
    "/bdcc",
    "/bdcc2",
    "/library",
    "/compare",
    "/portfolio",
    "/onchain",
    "/settings",
    "/methodology",
    "/developers",
    "/about",
    "/contact",
    "/privacy",
  ];
  return routes.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path.startsWith("/bdcc") ? "weekly" : "daily",
    priority: path === "" || path.startsWith("/bdcc") ? 1 : 0.6,
  }));
}
