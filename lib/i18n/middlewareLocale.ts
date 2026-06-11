import { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isSupportedLocale,
  type SupportedLocale,
} from "./config";
import {
  normalizeLocale,
  resolveBrowserLocale,
  resolveLocaleByCountry,
  stripLocaleFromPath,
} from "./normalize";
import { getCountryCode } from "@/lib/geo/country";

export interface LocaleResolution {
  /** The locale to apply for this request. */
  locale: SupportedLocale;
  /**
   * When the URL carried a locale prefix (e.g. `/vi/news`), the internal path to
   * rewrite to (`/news`). Null when no rewrite is needed.
   */
  rewritePath: string | null;
  /**
   * True when the resolved locale differs from the `ksh_locale` cookie (or the
   * cookie is absent/invalid), so the caller should refresh the cookie.
   */
  shouldSetCookie: boolean;
}

/**
 * Resolve the UI locale for a request following the 5-step priority (PRD §8.1):
 *
 *   1. User's explicit choice    → `ksh_locale` cookie
 *   2. URL path locale           → `/vi`, `/pt-BR`, …
 *   3. Browser/device locale     → `Accept-Language`
 *   4. countryCode (geo)         → `x-vercel-ip-country`
 *   5. DEFAULT_LOCALE            → `en`
 *
 * Note on precedence vs. the URL: the cookie wins over the URL path so a user's
 * deliberate dropdown selection is sticky across navigation. The URL path is
 * still honored for rewrite routing — when a path locale is present we rewrite
 * to the internal route regardless of which source won the locale, so the app
 * tree never sees the `/vi` prefix.
 *
 * `/ko` and any other non-supported prefix are not treated as locale segments
 * (stripLocaleFromPath only strips supported locales), so they fall through to
 * normal routing and resolve to `en` via the cookie/browser/geo chain.
 */
export function resolveRequestLocale(request: NextRequest): LocaleResolution {
  const { pathname } = request.nextUrl;
  const { locale: pathLocale, rest } = stripLocaleFromPath(pathname);

  // 1) Explicit user choice (cookie).
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  const cookieLocale = isSupportedLocale(cookieValue) ? cookieValue : null;

  // 3) Browser/device.
  const browserLocale = resolveBrowserLocale(
    request.headers.get("accept-language")
  );

  // 4) Geo countryCode.
  const countryLocale = resolveLocaleByCountry(getCountryCode(request));

  // Priority resolution. countryLocale already defaults to `en`, which serves
  // as step 5; normalizeLocale is the final safety gate (PRD §8.6).
  const resolved =
    cookieLocale ??
    pathLocale ??
    browserLocale ??
    countryLocale ??
    DEFAULT_LOCALE;
  const locale = normalizeLocale(resolved);

  // Rewrite when the URL carried a locale prefix so the app tree sees the
  // un-prefixed path. `rest` is "/" for a bare "/vi".
  const rewritePath = pathLocale ? rest : null;

  const shouldSetCookie = cookieLocale !== locale;

  return { locale, rewritePath, shouldSetCookie };
}

export { LOCALE_COOKIE, LOCALE_HEADER };
