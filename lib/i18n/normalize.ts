/**
 * Pure locale-resolution helpers. No framework imports here so these can run in
 * the middleware (edge), server components, and the client alike.
 */
import {
  DEFAULT_LOCALE,
  countryLocaleMap,
  isSupportedLocale,
  supportedUiLocales,
  type SupportedLocale,
} from "./config";

/**
 * Final fallback gate (PRD §8.6). Any resolved locale, regardless of source,
 * is normalized here before use: supported → keep, otherwise → `en`.
 */
export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (isSupportedLocale(locale)) return locale;
  return DEFAULT_LOCALE;
}

/**
 * Resolve a UI locale from a geo countryCode (PRD §8.5).
 * Unknown / unmapped / restricted countries → `en`.
 */
export function resolveLocaleByCountry(
  countryCode?: string | null
): SupportedLocale {
  if (!countryCode) return DEFAULT_LOCALE;
  const mapped = countryLocaleMap[countryCode.toUpperCase()];
  if (mapped && isSupportedLocale(mapped)) return mapped;
  return DEFAULT_LOCALE;
}

/**
 * Explicit values from §8.4 where a browser locale does NOT map to its base
 * language but to `en` (restricted/unsupported regions). Checked before the
 * generic exact/base-match logic.
 */
const BROWSER_LOCALE_OVERRIDES: Record<string, SupportedLocale> = {
  "pt-pt": "en", // European Portuguese → en (only pt-BR is supported)
  "zh-hk": "en", // Hong Kong → en (NOT zh-TW)
  "ja-jp": "en",
  "tr-tr": "en",
  "ko-kr": "en", // Korean is never a user-facing UI locale
};

/**
 * Map a single browser/device locale tag (e.g. "vi-VN", "pt-BR", "zh-TW")
 * to a supported UI locale (PRD §8.4). Returns null when nothing matches so the
 * caller can fall through to the next priority source.
 */
function matchBrowserTag(tag: string): SupportedLocale | null {
  const lower = tag.trim().toLowerCase();
  if (!lower) return null;

  // 1) Region-specific override (pt-PT→en, zh-HK→en, …).
  if (lower in BROWSER_LOCALE_OVERRIDES) return BROWSER_LOCALE_OVERRIDES[lower];

  // 2) Exact match against a supported locale (case-insensitive). Covers the
  //    region-bearing supported locales: pt-BR, zh-TW.
  const exact = supportedUiLocales.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  // 3) Base-language match (e.g. "vi-VN" → "vi", "es-MX" → "es", "hi-IN" → "hi",
  //    "ur-PK" → "ur", "ru-RU" → "ru", "uk-UA" → "uk", "id-ID" → "id").
  const base = lower.split("-")[0];
  const baseMatch = supportedUiLocales.find((l) => l.toLowerCase() === base);
  if (baseMatch) return baseMatch;

  return null;
}

/**
 * Resolve a UI locale from an `Accept-Language` header (PRD §8.4).
 * Walks the quality-ordered list and returns the first tag that resolves.
 * Returns null when none match (caller continues to countryCode).
 */
export function resolveBrowserLocale(
  acceptLanguage?: string | null
): SupportedLocale | null {
  if (!acceptLanguage) return null;

  // Parse "vi-VN,vi;q=0.9,en;q=0.8" → ordered tag list (q already in order).
  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean);

  for (const tag of tags) {
    const matched = matchBrowserTag(tag);
    if (matched) return matched;
  }
  return null;
}

/**
 * Split a leading locale segment off a pathname for rewrite routing.
 *
 *   "/vi/news/42"  → { locale: "vi",    rest: "/news/42" }
 *   "/pt-BR"       → { locale: "pt-BR", rest: "/" }
 *   "/news/42"     → { locale: null,    rest: "/news/42" }
 *   "/ko/login"    → { locale: null,    rest: "/ko/login" }  (ko is not supported → not stripped)
 *
 * Only strips a segment that is a *supported* UI locale. Matching is
 * case-insensitive but the returned locale is canonical (e.g. "pt-br" → "pt-BR").
 */
export function stripLocaleFromPath(pathname: string): {
  locale: SupportedLocale | null;
  rest: string;
} {
  const segments = pathname.split("/"); // "/vi/news" → ["", "vi", "news"]
  const first = segments[1] ?? "";
  if (!first) return { locale: null, rest: pathname };

  const lower = first.toLowerCase();
  const canonical = supportedUiLocales.find((l) => l.toLowerCase() === lower);
  if (!canonical) return { locale: null, rest: pathname };

  const rest = "/" + segments.slice(2).join("/");
  return { locale: canonical, rest: rest === "//" ? "/" : rest };
}
