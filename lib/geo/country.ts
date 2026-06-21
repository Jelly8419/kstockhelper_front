import { NextRequest } from "next/server";

/**
 * Cookie the middleware sets so client components can read the visitor's country
 * code (analytics `country_code`). Non-httpOnly on purpose: client JS reads it
 * (see lib/analytics/context.ts). Value is the ISO alpha-2 code or "" when the
 * country is unknown (e.g. local dev).
 */
export const COUNTRY_CODE_COOKIE = "x-country-code";

/**
 * Extract the requester's ISO 3166-1 alpha-2 country code on Vercel.
 *
 * Reads `request.geo.country` first (populated by Vercel's edge), then the
 * `x-vercel-ip-country` header as a fallback. Locally both are absent, so this
 * returns undefined (callers fall back to other locale sources).
 *
 * In non-production, `?debugCountry=XX` forces a country for testing.
 */
export function getCountryCode(request: NextRequest): string | undefined {
  let country = request.geo?.country;

  if (!country) {
    country = request.headers.get("x-vercel-ip-country") ?? undefined;
  }

  if (process.env.NODE_ENV !== "production") {
    const debug = request.nextUrl.searchParams.get("debugCountry");
    if (debug) country = debug.toUpperCase();
  }

  return country ? country.toUpperCase() : undefined;
}
