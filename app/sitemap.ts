import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { getNewsSitemapEntries } from "@/lib/api/news";
import { routing } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

const { locales, defaultLocale } = routing;

/** Per-locale hreflang map (+ x-default) for an un-prefixed path. */
function languagesFor(path: string): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const map: Record<string, string> = {};
  for (const locale of locales) map[locale] = `${SITE_URL}/${locale}${clean}`;
  map["x-default"] = `${SITE_URL}/${defaultLocale}${clean}`;
  return map;
}

/**
 * One sitemap entry per (locale, path), each carrying hreflang alternates so
 * search engines see the localized variants. URLs are locale-prefixed
 * (`/{locale}/...`) to match the routing.
 */
function localizedEntries(
  path: string,
  fields: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = languagesFor(path);
  const clean = path === "/" ? "" : path;
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${clean}`,
    alternates: { languages },
    ...fields,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries("/", { lastModified: now, changeFrequency: "hourly", priority: 1 }),
    ...localizedEntries("/login", { lastModified: now, changeFrequency: "monthly", priority: 0.3 }),
    ...localizedEntries("/signup", { lastModified: now, changeFrequency: "monthly", priority: 0.3 }),
    ...localizedEntries("/guide", { lastModified: now, changeFrequency: "monthly", priority: 0.3 }),
    ...localizedEntries("/privacy", { lastModified: now, changeFrequency: "yearly", priority: 0.2 }),
    ...localizedEntries("/terms", { lastModified: now, changeFrequency: "yearly", priority: 0.2 }),
  ];

  // Dynamic news detail routes, localized.
  const entries = await getNewsSitemapEntries();
  const newsRoutes: MetadataRoute.Sitemap = entries.flatMap((e) =>
    localizedEntries(`/news/${e.id}`, {
      lastModified: new Date(e.publishedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  return [...staticRoutes, ...newsRoutes];
}
