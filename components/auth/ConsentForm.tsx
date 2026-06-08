"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";

/**
 * Consent gate (A3): shown after OAuth sign-in when the user has not yet
 * accepted the Terms. Records consent on their profile row, then continues to
 * `next`.
 */
export function ConsentForm({ next }: { next: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
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

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span className="text-xs text-foreground">
          I have read and agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" size="lg" disabled={loading || !agreed}>
        {loading ? "Saving…" : "Agree and Continue"}
      </Button>
    </form>
  );
}
