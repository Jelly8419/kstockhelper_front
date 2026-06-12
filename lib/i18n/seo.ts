import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { routing } from "./routing";

/**
 * Build `alternates` (canonical + hreflang languages + x-default) for a given
 * un-prefixed path. With `localePrefix: 'always'`, every locale URL is
 * `${SITE_URL}/{locale}{path}`. x-default points at the default locale.
 *
 *   localizedAlternates("/news/42", "vi")
 *   → canonical: /vi/news/42
 *     languages: { en: /en/news/42, vi: /vi/news/42, …, "x-default": /en/news/42 }
 */
export function localizedAlternates(
  path: string,
  currentLocale: string
): Metadata["alternates"] {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  const url = (locale: string) => `${SITE_URL}/${locale}${clean}`;

  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = url(locale);
  }
  languages["x-default"] = url(routing.defaultLocale);

  return {
    canonical: url(currentLocale),
    languages,
  };
}
