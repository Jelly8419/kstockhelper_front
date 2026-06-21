import { COUNTRY_CODE_COOKIE } from "@/lib/geo/country";
import type { UserTier } from "@/types/user";
import type { MembershipStatus } from "./types";

/** Read a cookie value from `document.cookie`, or null if absent / SSR. */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/**
 * The visitor's IP country code, read from the `x-country-code` cookie set by
 * the middleware. Null when unknown (local dev → empty cookie, or absent).
 */
export function readCountryCode(): string | null {
  const value = readCookie(COUNTRY_CODE_COOKIE);
  return value ? value.toUpperCase() : null;
}

/**
 * Map the app's access tier to the analytics membership_status:
 * guest → 'guest', free → 'basic', premium → 'premium'.
 */
export function mapMembership(tier: UserTier): MembershipStatus {
  if (tier === "premium") return "premium";
  if (tier === "free") return "basic";
  return "guest";
}
