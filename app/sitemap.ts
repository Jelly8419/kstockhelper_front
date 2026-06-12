import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { getNewsSitemapEntries } from "@/lib/api/news";
import { routing } from "@/lib/i18n/routing";
import { contentLocales, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildDetailPath } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

const { locales } = routing;

/**
 * Locales indexed for news/disclosure detail (SEO PRD §7): the 6 with real
 * content translations. Other UI locales serve English-fallback content and are
 * intentionally excluded from the sitemap. `en` is prepended because it is the
 * source language, absent from `contentLocales` (translation rows only).
 */
const SEO_CONTENT_LOCALES = [DEFAULT_LOCALE, ...contentLocales];

/** Per-locale hreflang map (+ x-default) over a given locale set. */
function languagesFor(path: string, localeSet: readonly string[]): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const map: Record<string, string> = {};
  for (const locale of localeSet) map[locale] = `${SITE_URL}/${locale}${clean}`;
  map["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${clean}`;
  return map;
}

/**
 * One sitemap entry per (locale, path) over the FULL UI locale set, each
 * carrying hreflang alternates. Used for static pages (homepage, legal, …)
 * which are not under the news/disclosure SEO content restriction.
 */
function localizedEntries(
  path: string,
  fields: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = languagesFor(path, locales);
  const clean = path === "/" ? "" : path;
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${clean}`,
    alternates: { languages },
    ...fields,
  }));
}

/**
 * One sitemap entry per (locale, path) over the 6 SEO content locales only
 * (PRD §7-§9). Used for news/disclosure detail URLs so we only solicit indexing
 * of locales with real translated content.
 */
function contentLocalizedEntries(
  path: string,
  fields: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = languagesFor(path, SEO_CONTENT_LOCALES);
  return SEO_CONTENT_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
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

  // Dynamic news/disclosure detail routes: SEO content locales only, with the
  // `{id}-{slug}` URL and the correct /news/ vs /disclosures/ segment.
  const entries = await getNewsSitemapEntries();
  const detailRoutes: MetadataRoute.Sitemap = entries.flatMap((e) =>
    contentLocalizedEntries(buildDetailPath(e.category, e.seqId, e.slug), {
      lastModified: new Date(e.publishedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  return [...staticRoutes, ...detailRoutes];
}
