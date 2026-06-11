"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** Multi-color Google "G" mark (official brand colors), inline to avoid deps. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * "Continue with Google" OAuth button.
 * After Google auth, Supabase redirects to /auth/callback, which exchanges the
 * code for a session and gates first-time users through /consent.
 *
 * When `consentGiven` is true (the user already accepted the Terms on this
 * page), we pass it through the OAuth round-trip so the callback can record
 * consent and skip the /consent gate.
 */
export function GoogleButton({
  next = "/",
  consentGiven = false,
}: {
  next?: string;
  consentGiven?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      // Use the live origin so OAuth returns to the same host the user is on
      // (localhost in dev, production domain in prod).
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);
      if (consentGiven) callback.searchParams.set("consent", "1");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // On success the browser is redirected to Google — no further action.
    } catch {
      setError(t("auth.googleError"));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-white px-6 text-base font-medium text-[#1f1f1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {loading ? t("auth.connecting") : t("auth.continueWithGoogle")}
      </button>
      {error && <p className="text-xs text-down">{error}</p>}
    </div>
  );
}
