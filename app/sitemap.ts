import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { getNewsSitemapEntries } from "@/lib/api/news";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic news detail routes.
  const entries = await getNewsSitemapEntries();
  const newsRoutes: MetadataRoute.Sitemap = entries.map((e) => ({
    url: `${SITE_URL}/news/${e.id}`,
    lastModified: new Date(e.publishedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...newsRoutes];
}
