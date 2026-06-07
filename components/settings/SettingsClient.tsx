"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function SettingsClient() {
  const router = useRouter();
  const { tier, email, bybitUid, isLoading, refresh } = useAuth();

  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Route guard: redirect guests to login once auth has resolved.
  useEffect(() => {
    if (!isLoading && tier === "guest") {
      router.replace("/login");
    }
  }, [isLoading, tier, router]);

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = uid.trim();
    if (!trimmed) {
      setError("Please enter your Bybit UID.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bybit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bybitUid: trimmed }),
      });
      // Backend contract: { success: boolean, message: string }.
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!data?.success) {
        setError(
          data?.message ??
            "UID not found. Make sure you signed up via our referral link."
        );
        return;
      }
      setSuccess(true);
      await refresh(); // pick up the new premium tier
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading || tier === "guest") {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const isConnected = tier === "premium";

  return (
    <div className="flex flex-col gap-8">
      {/* Account */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">Account</h2>
        <p className="text-sm text-foreground">{email}</p>
      </section>

      {/* Bybit connection */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Bybit Connection
          </h2>
          {isConnected && <Badge tone="brand">Premium</Badge>}
        </div>

        {isConnected ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-up">Connected</p>
            {bybitUid && (
              <p className="text-xs text-muted">UID: {bybitUid}</p>
            )}
            <p className="mt-1 text-sm text-muted">
              You have full access to all news &amp; disclosures.
            </p>
          </div>
        ) : (
          <>
            {success ? (
              <p className="text-sm font-medium text-up">
                Connected! Premium unlocked.
              </p>
            ) : (
              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <Input
                  label="Bybit UID"
                  name="bybitUid"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="e.g. 12345678"
                />
                {error && <p className="text-xs text-down">{error}</p>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Connecting…" : "Connect & Unlock Premium"}
                </Button>
              </form>
            )}

            {/* How to find your UID */}
            <div className="mt-2 rounded-lg border border-border bg-background p-4">
              <p className="mb-2 text-xs font-semibold text-foreground">
                How to find your Bybit UID
              </p>
              <ol className="flex flex-col gap-1 text-xs text-muted">
                <li>1. Open the Bybit app</li>
                <li>2. Tap your profile icon</li>
                <li>3. Copy the UID below your name</li>
              </ol>
            </div>
          </>
        )}
      </section>

      {/* Logout */}
      <section>
        <Button variant="secondary" onClick={handleLogout}>
          Log Out
        </Button>
      </section>
    </div>
  );
}
