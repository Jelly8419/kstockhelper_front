import { NextRequest } from "next/server";
import { getCountryCode } from "./country";

/** Header the frontend reads to decide whether to render the banner. */
export const SHOW_BANNER_HEADER = "x-show-banner";

/**
 * Cookie the middleware sets so client components know whether the visitor is in
 * a restricted region. Non-httpOnly on purpose: client JS reads it (see
 * `useRestrictedRegion`). Value is "1" (restricted) or "0" (allowed).
 */
export const RESTRICTED_REGION_COOKIE = "x-restricted-region";

/**
 * Countries where the "Trade Korea's Stock Market" banner is hidden.
 * (Regulatory / rollout reasons.)
 */
const BLOCKED_COUNTRIES = new Set<string>([
  "KR",
  "US",
  "CA",
  "CN",
  "HK",
  "SG",
  "KP",
  "IR",
  "SY",
  "CU",
  "JP",
  "GB",
  "NL",
  "IL",
  "NG",
  "TR",
  "UZ",
]);

/** Korea-based IPs allowed to see the banner despite KR being blocked. */
const KR_WHITELIST_IPS = new Set<string>([
  "220.65.243.225", // developer
]);

/**
 * Korea-based IP ranges (CIDR) allowed to see the banner despite KR being
 * blocked. Used for whitelisted users whose IP changes within a known subnet.
 */
const KR_WHITELIST_CIDRS: string[] = [
  "115.138.0.0/16", // PM (dynamic IP, e.g. 115.138.38.35 / 115.138.26.11)
];

/** Convert a dotted-quad IPv4 string to a 32-bit unsigned integer. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;

  let result = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null;
    result = result * 256 + octet;
  }
  return result >>> 0;
}

/** Check whether an IPv4 address falls within a CIDR range (e.g. 1.2.0.0/16). */
function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;

  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null) return false;

  // /0 matches everything; avoid the undefined behaviour of `<<32`.
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/** Whether an IP is allowed via the exact-match Set or any CIDR range. */
function isWhitelistedKrIp(ip: string): boolean {
  if (KR_WHITELIST_IPS.has(ip)) return true;
  return KR_WHITELIST_CIDRS.some((cidr) => ipInCidr(ip, cidr));
}

/** The requester's first client IP (`request.ip` on Vercel, else x-forwarded-for). */
export function requestIp(request: NextRequest): string {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "";
  return ip.split(",")[0].trim();
}

/**
 * Whether the request comes from a whitelisted internal IP (developer / PM),
 * regardless of country. Used by the Price Gap feature-flag gate so internal
 * users can preview it before public rollout (feature-flag-plan §1).
 */
export function isWhitelistedRequest(request: NextRequest): boolean {
  return isWhitelistedKrIp(requestIp(request));
}

/**
 * Decide whether the banner should be shown for this request.
 *
 * Rules:
 *  - Unknown country (e.g. local dev) → show (true).
 *  - Blocked country → hide, EXCEPT KR requests from whitelisted IPs.
 *
 * `request.geo` / `request.ip` are only populated on Vercel; locally they are
 * undefined, so the banner shows. In development, ?debugCountry=XX can force a
 * country for testing.
 */
export function shouldShowBanner(request: NextRequest): boolean {
  const country = getCountryCode(request);

  // Unknown → show.
  if (!country) return true;

  if (!BLOCKED_COUNTRIES.has(country)) return true;

  // Blocked. KR has an IP whitelist exception.
  if (country === "KR") {
    if (isWhitelistedKrIp(requestIp(request))) return true;
  }

  return false;
}

/**
 * Whether this request originates from a region where exchange-linked Premium is
 * unavailable (regulatory). Defined as the inverse of `shouldShowBanner`, so the
 * "restricted region" set stays identical to the "banner hidden" set — including
 * the KR IP whitelist exception and the unknown-country (local dev) case, which
 * are treated as NOT restricted.
 */
export function isRestrictedRegion(request: NextRequest): boolean {
  return !shouldShowBanner(request);
}

/**
 * Whether this request is in the restricted-country group for the SUBSCRIPTION
 * policy (PayPal-only Premium): blocked set ∪ unknown country.
 *
 * This is deliberately SEPARATE from `isRestrictedRegion`/`shouldShowBanner`:
 *  - It does NOT honor the KR IP whitelist. The whitelist exists so internal
 *    KR users (developer / PM) can preview the banner / Price Gap before public
 *    rollout — that's a *visibility* concession, not a *regulatory* one. For
 *    Premium, a KR user is restricted regardless of IP (KR can't use exchange
 *    referral/UID), so whitelisted KR IPs must still get the subscription path.
 *    Hence we check `BLOCKED_COUNTRIES` directly instead of `isRestrictedRegion`.
 *  - The subscription policy requires a safe default — country-detection failure
 *    is treated AS restricted (so a non-detectable visitor gets the PayPal path,
 *    never the exchange/UID path). Unknown → restricted applies in production
 *    only, so local dev (always unknown) keeps the allowed-country UI; use
 *    ?debugCountry=KR to exercise the restricted path locally.
 *
 * Drives the `x-restricted-region` cookie and the `/subscription` access gate.
 */
export function isRestrictedForSubscription(request: NextRequest): boolean {
  const country = getCountryCode(request);

  // Known blocked country → restricted (KR included, whitelist NOT applied).
  if (country && BLOCKED_COUNTRIES.has(country)) return true;

  // Unknown country: safe-default to restricted in production only.
  if (!country && process.env.NODE_ENV === "production") return true;

  return false;
}

/**
 * Whether this request is from KR and must be COMPLETELY blocked — no Gap
 * Monitor, no subscription, no UID/guide. KR has no Premium path at all: our
 * PayPal business account is KR-registered (PayPal forbids KR↔KR payments) and
 * exchange referral/UID is unavailable in KR. So KR users are bounced from
 * /price-gap, /subscription, and /guide to the region-blocked notice.
 *
 * EXCEPTION: whitelisted internal IPs (developer / PM) are NOT blocked — they
 * are treated like an allowed country (full access, UID path, and direct-URL
 * access to /subscription). This is the same whitelist used for Price Gap
 * preview; here it doubles as the "internal users bypass the KR blackout" gate.
 *
 * Deliberately separate from BLOCKED_COUNTRIES / isRestrictedForSubscription:
 * KR stays in BLOCKED_COUNTRIES (so the banner stays hidden and other gates are
 * unchanged); this function is the extra, KR-only blackout the middleware applies
 * BEFORE the subscription gates.
 */
export function isKrBlocked(request: NextRequest): boolean {
  if (getCountryCode(request) !== "KR") return false;
  // Developer / PM whitelist: bypass the KR blackout (treated as allowed).
  if (isWhitelistedKrIp(requestIp(request))) return false;
  return true;
}
