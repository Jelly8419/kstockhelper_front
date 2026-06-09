/**
 * Edge-safe admin constants and pure helpers (no next/headers import).
 * Importable from middleware (edge runtime) and route handlers alike.
 */

/** Cookie name holding the admin access token. */
export const ADMIN_COOKIE = "admin_token";

/** Base path for the admin console (PRD 4.1: avoid the guessable /admin). */
export const ADMIN_BASE_PATH = "/console";
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;

/** Header carrying the current pathname so server components (e.g. the root
 *  layout) can branch on it — Next doesn't expose the path to layouts. */
export const PATHNAME_HEADER = "x-pathname";

/** Max admin memo length (PRD 4.10 / spec §5). */
export const MEMO_MAX_LENGTH = 1000;

/**
 * Decode a JWT's `exp` (seconds) without verifying the signature.
 * Returns null if malformed or no exp. Edge-safe (atob, no Buffer).
 */
export function readJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload)) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

/** True if the token is absent or its exp claim is in the past. */
export function isTokenExpired(token: string | undefined | null): boolean {
  if (!token) return true;
  const exp = readJwtExp(token);
  if (exp === null) return false; // can't tell → let the backend decide
  return exp * 1000 <= Date.now();
}
