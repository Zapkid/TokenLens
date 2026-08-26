import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const routes = [
    "",
    "/bdcc",
    "/library",
    "/compare",
    "/portfolio",
    "/onchain",
    "/settings",
    "/methodology",
  ];
  return routes.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path === "/bdcc" ? "weekly" : "daily",
    priority: path === "" || path === "/bdcc" ? 1 : 0.6,
  }));
}
