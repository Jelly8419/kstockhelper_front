import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session, attaching the refreshed `sb-*` cookies
 * onto a caller-provided base response.
 *
 * `baseResponse` is the response another middleware (next-intl) already built —
 * it may be a locale redirect or a locale-rewritten `next`, and may carry the
 * locale cookie. Supabase's `setAll` copies any `sb-*` cookies onto it without
 * disturbing those, so refreshing the session never drops next-intl's routing
 * decision or its cookie. When no base is given, a plain `next` is used.
 */
export async function updateSession(
  request: NextRequest,
  baseResponse?: NextResponse
) {
  const response =
    baseResponse ?? NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to the same response next-intl produced so auth cookies and
          // the locale routing/cookie coexist.
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
