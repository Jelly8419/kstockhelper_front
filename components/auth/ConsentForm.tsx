"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { LegalContent } from "@/components/legal/LegalContent";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";

/**
 * Consent gate (A3): shown after OAuth sign-in when the user has not yet
 * accepted the Terms. Records consent on their profile row, then continues to
 * `next`.
 */
export function ConsentForm({ next }: { next: string }) {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms || !agreePrivacy) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
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
        setError("Could not save your consent. Please try again.");
        return;
      }

      router.replace(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Before you continue, please review and agree to our terms.
      </p>

      <div className="flex flex-col gap-3">
        <Accordion
          title={
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="text-xs text-foreground">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-brand hover:underline"
                >
                  Terms of Service
                </a>
              </span>
            </label>
          }
          scrollMaxHeight="14rem"
        >
          <LegalContent document={TERMS_OF_SERVICE} />
        </Accordion>

        <Accordion
          title={
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="text-xs text-foreground">
                I agree to the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-brand hover:underline"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
          }
          scrollMaxHeight="14rem"
        >
          <LegalContent document={PRIVACY_POLICY} />
        </Accordion>
      </div>

      {error && <p className="text-xs text-down">{error}</p>}
      <Button
        type="submit"
        size="lg"
        disabled={loading || !agreeTerms || !agreePrivacy}
      >
        {loading ? "Saving…" : "Agree and Continue"}
      </Button>
    </form>
  );
}
