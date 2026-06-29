/**
 * i18n core configuration: supported locales, country→locale mapping,
 * display names, and the cookie/header keys used to carry the active locale
 * between the middleware, server components, and the client.
 *
 * Scope: static UI strings only (see i18n PRD). News/disclosure/AI content
 * translation is governed by a separate policy.
 */

/** Default UI language. Every UI key must have an `en` fallback value. */
export const DEFAULT_LOCALE = "en";

/**
 * Locales exposed to end users. A locale qualifies if it is spoken in a
 * referral-eligible country with meaningful users. Korean (`ko`) is NOT here —
 * it is a Google Sheet reference column only, never a user-facing UI language.
 *
 * Note: `ur` (Urdu) is RTL but ships LTR-only in the MVP; RTL layout is deferred.
 */
export const supportedUiLocales = [
  "en",
  "vi",
  "pt-BR",
  "es",
  "id",
  "hi",
  "ur",
  "ru",
  "uk",
  "zh-TW",
  "ja",
  "zh-CN",
] as const;

export type SupportedLocale = (typeof supportedUiLocales)[number];

/**
 * Locales for which news/disclosure CONTENT is translated (separate from UI
 * i18n). Per the content-translation policy, only these get translated
 * `translated_title` / `summary` / `key_points`; every other locale (including
 * `en` and supported-UI-only locales like `es`/`id`) falls back to the English
 * content fields. `en` is intentionally absent — the news body itself is the
 * English source, not a translation row.
 */
export const contentLocales = ["vi", "ru", "pt-BR", "hi", "uk"] as const;

export type ContentLocale = (typeof contentLocales)[number];

/** Is this locale one we translate news/disclosure content into? */
export function isContentLocale(value: unknown): value is ContentLocale {
  return (
    typeof value === "string" &&
    (contentLocales as readonly string[]).includes(value)
  );
}

/**
 * Excluded or deferred locales — kept for documentation/intent, not selectable.
 *
 * `ja` and `zh-CN` were previously here (referral restriction), but the Real
 * Estate service exposes them as UI languages: JP/CN remain restricted at the
 * *country* level (see BLOCKED_COUNTRIES in geo/bannerGate — banner/subscription/
 * guide stay blocked), yet the Real Estate pages are open to all regions, so
 * those visitors need their own language. Restriction is country-based, not
 * locale-based, so adding the locales doesn't loosen any country gate.
 */
export const excludedOrDeferredLocales = [
  "tr", // Türkiye referral restriction
  "bn", // deferred — revisit if Bangladesh is targeted
  "th", // deferred — revisit if Thailand is targeted
  "tl", // deferred — revisit if Philippines is targeted
] as const;

/**
 * ISO 3166-1 alpha-2 countryCode → BCP 47 UI locale.
 *
 * This drives *automatic* UI locale selection by geo. JP→ja and CN→zh-CN are
 * mapped so those visitors see the Real Estate pages in their language; the
 * country-level restrictions (banner/subscription/guide) still apply via
 * BLOCKED_COUNTRIES, independent of locale. HK is still mapped to nothing (NOT
 * zh-TW) and TR is excluded. Countries absent from this map fall back to `en`.
 */
export const countryLocaleMap: Record<string, SupportedLocale> = {
  VN: "vi",
  BR: "pt-BR",
  AR: "es",
  VE: "es",
  CO: "es",
  MX: "es",
  PE: "es",
  CL: "es",
  EC: "es",
  BO: "es",
  PY: "es",
  UY: "es",
  ID: "id",
  IN: "hi",
  PK: "ur",
  RU: "ru",
  UA: "uk",
  TW: "zh-TW",
  JP: "ja",
  CN: "zh-CN",
};

/** Dropdown labels — each language shown in its own native name (PRD §9.3). */
export const localeDisplayNames: Record<SupportedLocale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  "pt-BR": "Português (BR)",
  es: "Español",
  id: "Bahasa Indonesia",
  hi: "हिन्दी",
  ur: "اردو",
  ru: "Русский",
  uk: "Українська",
  "zh-TW": "繁體中文",
  ja: "日本語",
  "zh-CN": "简体中文",
};

/** localStorage + cookie key persisting the user's explicit locale choice. */
export const LOCALE_COOKIE = "ksh_locale";

/** Request header the middleware sets so server components can read the locale. */
export const LOCALE_HEADER = "x-locale";

/** Type guard: is this string a supported UI locale? */
export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    (supportedUiLocales as readonly string[]).includes(value)
  );
}
