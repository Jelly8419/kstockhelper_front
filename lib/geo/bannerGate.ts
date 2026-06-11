import { NextRequest } from "next/server";
import { getCountryCode } from "./country";

/** Header the frontend reads to decide whether to render the banner. */
export const SHOW_BANNER_HEADER = "x-show-banner";

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
  "115.138.38.35", // PM
  "220.65.243.225", // developer
]);

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
    if (KR_WHITELIST_IPS.has(firstIp)) return true;
  }

  return false;
}
