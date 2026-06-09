/**
 * Admin session = the backend-issued JWT stored in an HttpOnly cookie.
 *
 * The frontend treats the token as opaque (the backend signs/verifies it).
 * Cookie reads/writes here require next/headers, so this module is for
 * route handlers and server components only — middleware uses the edge-safe
 * helpers in ./constants.
 */

import { cookies } from "next/headers";

export {
  ADMIN_COOKIE,
  ADMIN_BASE_PATH,
  ADMIN_LOGIN_PATH,
  readJwtExp,
  isTokenExpired,
} from "./constants";

import { ADMIN_COOKIE } from "./constants";

/** Token lifetime hint (backend default is 8h). Cookie maxAge in seconds. */
const COOKIE_MAX_AGE = 8 * 60 * 60;

/** Store the admin token (route handlers only — needs a writable cookie store). */
export function setAdminToken(token: string): void {
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Read the admin token from the cookie store (server components / routes). */
export function getAdminToken(): string | null {
  return cookies().get(ADMIN_COOKIE)?.value ?? null;
}

/** Clear the admin session cookie (logout / 401). */
export function clearAdminToken(): void {
  cookies().delete(ADMIN_COOKIE);
}
