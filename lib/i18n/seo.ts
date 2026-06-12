import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { routing } from "./routing";
import { contentLocales, DEFAULT_LOCALE } from "./config";

/**
 * Locales that get search-indexed for news/disclosure detail (SEO PRD §7-§9):
 * the 6 with real content translations. `en` is the source language and is NOT
 * in `contentLocales` (which is translation rows only), so it must be prepended
 * explicitly here — using `contentLocales` alone would silently drop English.
 */
const SEO_CONTENT_LOCALES = [DEFAULT_LOCALE, ...contentLocales] as const;

function isSeoContentLocale(locale: string): boolean {
  return (SEO_CONTENT_LOCALES as readonly string[]).includes(locale);
}

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

/**
 * Build `alternates` for a news/disclosure DETAIL page under the SEO content
 * policy (PRD §8-§9). Unlike `localizedAlternates`, this restricts indexing to
 * the 6 translated locales:
 *
 * - **canonical**: a SEO-content locale (`en`/`vi`/`ru`/`pt-BR`/`hi`/`uk`)
 *   points at itself; every other UI locale shows English-fallback content, so
 *   it canonicalizes to the `en` URL (§8.2) — consolidating ranking signal.
 * - **hreflang languages**: only the 6 SEO locales + `x-default` (→ en). The
 *   English-fallback locales are intentionally absent (§9).
 *
 *   contentDetailAlternates("/news/12345-foo", "vi") → canonical /vi/news/12345-foo
 *   contentDetailAlternates("/news/12345-foo", "id") → canonical /en/news/12345-foo
 */
export function contentDetailAlternates(
  path: string,
  currentLocale: string
): Metadata["alternates"] {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  const url = (locale: string) => `${SITE_URL}/${locale}${clean}`;

  const languages: Record<string, string> = {};
  for (const locale of SEO_CONTENT_LOCALES) {
    languages[locale] = url(locale);
  }
  languages["x-default"] = url(DEFAULT_LOCALE);

  // Self-canonical only for the 6 translated locales; all others fall back to en.
  const canonicalLocale = isSeoContentLocale(currentLocale)
    ? currentLocale
    : DEFAULT_LOCALE;

  return {
    canonical: url(canonicalLocale),
    languages,
  };
}
