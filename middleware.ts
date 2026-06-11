import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldShowBanner, SHOW_BANNER_HEADER } from "@/lib/geo/bannerGate";
import {
  resolveRequestLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
} from "@/lib/i18n/middlewareLocale";
import {
  ADMIN_BASE_PATH,
  ADMIN_COOKIE,
  ADMIN_LOGIN_PATH,
  PATHNAME_HEADER,
  isTokenExpired,
} from "@/lib/admin/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  request.headers.set(PATHNAME_HEADER, pathname);

  // -------------------------------------------------------------------------
  // Admin console guard: protect /console/* (except the login page).
  // The authoritative auth check is the backend (401 on data calls); this is
  // a cheap edge gate that redirects unauthenticated/expired sessions to login
  // before any admin page renders. /api/admin/* is intentionally NOT guarded
  // here — those routes handle 401 themselves and return JSON.
  // -------------------------------------------------------------------------
  if (
    pathname.startsWith(ADMIN_BASE_PATH) &&
    pathname !== ADMIN_LOGIN_PATH
  ) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (isTokenExpired(token)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Authenticated admin pages don't need the Supabase session refresh, but
    // still forward the modified request headers (x-pathname) to the layout.
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // -------------------------------------------------------------------------
  // Public site: resolve UI locale, geo-gate the banner, refresh the session.
  // -------------------------------------------------------------------------
  const showBanner = shouldShowBanner(request);
  request.headers.set(SHOW_BANNER_HEADER, showBanner ? "true" : "false");

  // Resolve the active locale (5-step priority) and forward it to server
  // components via x-locale. When the URL carries a locale prefix (/vi/…) we
  // rewrite to the internal path. The locale cookie and any rewrite are applied
  // on the SAME response Supabase writes its session cookies to, so refreshing
  // the locale never drops the auth session.
  const { locale, rewritePath, shouldSetCookie } = resolveRequestLocale(request);
  request.headers.set(LOCALE_HEADER, locale);

  return await updateSession(request, {
    rewritePath,
    setLocaleCookie: shouldSetCookie ? { name: LOCALE_COOKIE, value: locale } : null,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
