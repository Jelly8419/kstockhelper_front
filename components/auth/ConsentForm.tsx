"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Consent gate (A3): shown after OAuth sign-in when the user has not yet
 * accepted the Terms. Records consent on their profile row, then sends the
 * first-time user to the guide page.
 */
export function ConsentForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError(t("auth.errorAgreeRequired"));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("users")
        .update({
          terms_agreed_at: now,
          terms_version: TERMS_OF_SERVICE.lastUpdated,
          privacy_agreed_at: now,
          privacy_version: PRIVACY_POLICY.lastUpdated,
        })
        .eq("id", user.id);

      if (error) {
        setError(t("auth.errorConsentFailed"));
        return;
      }

      // Consenting here means a first-time sign-up → land on the guide page.
      router.replace("/guide");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("auth.consentIntro")}</p>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span className="text-xs text-foreground">
          {t("auth.agreePrefix")}{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            {t("footer.terms")}
          </a>{" "}
          {t("auth.agreeMiddle")}{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            {t("footer.privacy")}
          </a>
          .
        </span>
      </label>

      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" size="lg" disabled={loading || !agreed}>
        {loading ? t("auth.saving") : t("auth.agreeAndContinue")}
      </Button>
    </form>
  );
}
