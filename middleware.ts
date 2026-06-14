import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import {
  shouldShowBanner,
  SHOW_BANNER_HEADER,
  isRestrictedRegion,
  RESTRICTED_REGION_COOKIE,
  isWhitelistedRequest,
} from "@/lib/geo/bannerGate";
import { fetchFeatureFlags } from "@/lib/featureFlags/flags";
import {
  PRICE_GAP_VISIBLE_COOKIE,
  PRICE_GAP_VISIBLE_HEADER,
} from "@/lib/featureFlags/constants";
import { getCountryCode } from "@/lib/geo/country";
import { resolveLocaleByCountry } from "@/lib/i18n/normalize";
import { resolveBrowserLocale } from "@/lib/i18n/normalize";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import {
  ADMIN_BASE_PATH,
  ADMIN_COOKIE,
  ADMIN_LOGIN_PATH,
  PATHNAME_HEADER,
  isTokenExpired,
} from "@/lib/admin/constants";

const handleI18nRouting = createMiddleware(routing);

/**
 * Whether `pathname` targets the Start-Trading guide page (`/guide` or
 * `/{locale}/guide`). Used to block direct access from restricted regions.
 */
function isGuidePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  // `/guide` or `/{locale}/guide`
  if (segments[0] === "guide" && segments.length === 1) return true;
  if (segments[1] === "guide" && segments.length === 2) return true;
  return false;
}

/**
 * Whether `pathname` targets the Price Gap Monitor (`/price-gap` or
 * `/{locale}/price-gap`). Gated by the `priceGapPublic` feature flag.
 */
function isPriceGapPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "price-gap" && segments.length === 1) return true;
  if (segments[1] === "price-gap" && segments.length === 2) return true;
  return false;
}

/** Locale prefix of the request, or the default locale when none is present. */
function localeFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && (routing.locales as readonly string[]).includes(first)
    ? first
    : routing.defaultLocale;
}

/**
 * Layer the geo/IP country into locale detection (PRD §3 priority:
 * cookie → Accept-Language → IP country → en).
 *
 * next-intl natively detects cookie → Accept-Language only. So when the user has
 * no locale cookie AND their Accept-Language doesn't resolve to a supported
 * locale, we inject the country-derived locale as an Accept-Language hint so
 * next-intl's detection picks it up. We never override an explicit cookie or a
 * usable browser language.
 */
function applyCountryLocaleHint(request: NextRequest) {
  const hasCookie = request.cookies.has(LOCALE_COOKIE);
  if (hasCookie) return;

  const browserLocale = resolveBrowserLocale(
    request.headers.get("accept-language")
  );
  if (browserLocale) return; // Accept-Language already yields a supported locale.

  const countryLocale = resolveLocaleByCountry(getCountryCode(request));
  // resolveLocaleByCountry returns 'en' when unknown; only hint for a real match.
  if (countryLocale !== routing.defaultLocale) {
    request.headers.set("accept-language", countryLocale);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  request.headers.set(PATHNAME_HEADER, pathname);

  // -------------------------------------------------------------------------
  // Admin console (/console/*): own auth gate, no locale prefix, no i18n.
  // -------------------------------------------------------------------------
  if (pathname.startsWith(ADMIN_BASE_PATH) && pathname !== ADMIN_LOGIN_PATH) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (isTokenExpired(token)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers: request.headers } });
  }
  // Admin login page: still skip i18n, but no guard.
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // -------------------------------------------------------------------------
  // API routes & OAuth callback: no locale prefix. Refresh the session only.
  // (These handle their own responses; locale-routing them would 404/redirect.)
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return await updateSession(request);
  }

  // -------------------------------------------------------------------------
  // Public site pages: locale routing (next-intl) + banner geo-gate + session.
  // next-intl owns the URL: `/` → `/{locale}/…` redirect, and serves the
  // `[locale]` segment. We compose its response with the Supabase session so
  // auth cookies and locale routing share one response.
  // -------------------------------------------------------------------------
  const showBanner = shouldShowBanner(request);
  request.headers.set(SHOW_BANNER_HEADER, showBanner ? "true" : "false");

  const restricted = isRestrictedRegion(request);

  // Restricted regions cannot access the Start-Trading guide directly — send
  // them home (`/{locale}/`). Server-side (IP-based) so it can't be bypassed by
  // tampering with the client-readable cookie below.
  if (restricted && isGuidePath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeFromPath(pathname)}/`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(RESTRICTED_REGION_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
    return await updateSession(request, redirect);
  }

  // Price Gap Monitor visibility: public when the flag is ON, otherwise only
  // whitelisted internal IPs (developer / PM) for pre-launch verification.
  const { priceGapPublic } = await fetchFeatureFlags();
  const priceGapVisible = priceGapPublic || isWhitelistedRequest(request);
  // Header so the SAME request's server components (home card) can read it
  // (the cookie below only arrives on the next request).
  request.headers.set(PRICE_GAP_VISIBLE_HEADER, priceGapVisible ? "true" : "false");

  // Hidden visitors hitting the page directly → send home (can't be bypassed by
  // tampering with the client cookie below).
  if (!priceGapVisible && isPriceGapPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeFromPath(pathname)}/`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(PRICE_GAP_VISIBLE_COOKIE, "0", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
    return await updateSession(request, redirect);
  }

  applyCountryLocaleHint(request);

  const intlResponse = handleI18nRouting(request);

  // A redirect (e.g. `/` → `/en`) is terminal — return it (still refresh the
  // session cookies onto it so an in-flight session isn't dropped on redirect).
  const response = await updateSession(request, intlResponse);

  // Expose the restricted-region decision to client components (non-httpOnly).
  response.cookies.set(RESTRICTED_REGION_COOKIE, restricted ? "1" : "0", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  // Expose Price Gap visibility (for the home card).
  response.cookies.set(PRICE_GAP_VISIBLE_COOKIE, priceGapVisible ? "1" : "0", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals, static assets, and image files.
    // API routes are matched so the session refresh still runs there.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
