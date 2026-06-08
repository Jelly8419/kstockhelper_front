import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";

/**
 * OAuth / magic-link redirect target.
 *
 * Exchanges the `code` for a session, then gates first-time users (no recorded
 * legal consent) through /consent before letting them into the app.
 *
 * If the user already accepted the Terms before starting OAuth (consent=1, set
 * by the sign-up page), we record consent here and skip the /consent gate.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));
  const consentGiven = searchParams.get("consent") === "1";

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
    const { data: profile } = await supabase
      .from("users")
      .select("terms_agreed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.terms_agreed_at) {
      // Consent already given on the sign-up page → record it and continue.
      if (consentGiven) {
        const now = new Date().toISOString();
        await supabase
          .from("users")
          .update({
            terms_agreed_at: now,
            terms_version: TERMS_OF_SERVICE.lastUpdated,
            privacy_agreed_at: now,
            privacy_version: PRIVACY_POLICY.lastUpdated,
          })
          .eq("id", user.id);
      } else {
        // Otherwise (e.g. arrived via the login page) gate through /consent (A3).
        const consent = new URL("/consent", origin);
        consent.searchParams.set("next", next);
        return NextResponse.redirect(consent.toString());
      }
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
