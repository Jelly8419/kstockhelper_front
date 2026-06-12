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
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "";
    const firstIp = ip.split(",")[0].trim();
    if (isWhitelistedKrIp(firstIp)) return true;
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
