import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/** Optional locale handling layered onto the session refresh response. */
export interface SessionLocaleOptions {
  /**
   * When set, the response rewrites to this internal path (the URL stays as the
   * user typed it, e.g. `/vi/news`, but the app renders `/news`).
   */
  rewritePath?: string | null;
  /** When set, persists the active locale in the `ksh_locale` cookie. */
  setLocaleCookie?: { name: string; value: string } | null;
}

/**
 * Refreshes the Supabase auth session on every request, optionally applying a
 * locale rewrite and locale cookie on the SAME response.
 *
 * Why everything funnels through one response: Supabase's `setAll` rebuilds the
 * response (`NextResponse.next`/`rewrite`) and re-applies the auth cookies. If
 * the locale rewrite or locale cookie were applied on a *separate* response,
 * whichever response is returned last would drop the other's cookies — in
 * practice silently logging the user out. So the rewrite target and locale
 * cookie are threaded into the same builder Supabase writes its cookies to, and
 * the locale cookie never overwrites a Supabase cookie (distinct name).
 */
export async function updateSession(
  request: NextRequest,
  options: SessionLocaleOptions = {}
) {
  const { rewritePath, setLocaleCookie } = options;

  const buildResponse = () => {
    if (rewritePath) {
      const url = request.nextUrl.clone();
      url.pathname = rewritePath;
      return NextResponse.rewrite(url, {
        request: { headers: request.headers },
      });
    }
    return NextResponse.next({ request: { headers: request.headers } });
  };

  // Preserve any request headers set upstream (e.g. x-show-banner, x-locale) so
  // server components can read them via headers().
  let response = buildResponse();

  // Persist the locale cookie up front; it is re-applied after any Supabase
  // cookie write below (setAll rebuilds the response). Distinct name from
  // Supabase's `sb-*` cookies, so the two never collide.
  if (setLocaleCookie) {
    response.cookies.set(setLocaleCookie.name, setLocaleCookie.value, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = buildResponse();
          // Re-apply the locale cookie onto the rebuilt response so it survives
          // alongside the freshly-written Supabase session cookies.
          if (setLocaleCookie) {
            response.cookies.set(setLocaleCookie.name, setLocaleCookie.value, {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
              sameSite: "lax",
            });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
