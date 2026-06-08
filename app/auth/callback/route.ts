import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / magic-link redirect target.
 *
 * Exchanges the `code` for a session, then gates first-time users (no recorded
 * legal consent) through /consent before letting them into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // The profile row is created by the on_auth_user_created DB trigger.
    // First-time users have no recorded consent (or no row yet) → gate through
    // /consent (A3) before entering the app.
    const { data: profile } = await supabase
      .from("users")
      .select("terms_agreed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.terms_agreed_at) {
      const consent = new URL("/consent", origin);
      consent.searchParams.set("next", next);
      return NextResponse.redirect(consent.toString());
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}

/** Only allow same-origin relative paths to prevent open-redirect. */
function sanitizeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}
