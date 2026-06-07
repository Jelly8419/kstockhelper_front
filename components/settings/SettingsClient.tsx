"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChangeUidModal } from "./ChangeUidModal";

export function SettingsClient() {
  const router = useRouter();
  const auth = useAuth();
  const { tier, email, bybitUid, binanceUid, binanceStatus, isLoading } = auth;

  // Route guard: redirect guests to login once auth has resolved.
  useEffect(() => {
    if (!isLoading && tier === "guest") {
      router.replace("/login");
    }
  }, [isLoading, tier, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading || tier === "guest") {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Account */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">Account</h2>
        <p className="text-sm text-foreground">{email}</p>
      </section>

      <BybitSection
        connected={tier === "premium" && !!bybitUid}
        bybitUid={bybitUid}
        onConnected={auth.refresh}
      />

      <BinanceSection
        status={binanceStatus}
        binanceUid={binanceUid}
        onSubmitted={auth.refresh}
      />

      {/* Logout */}
      <section>
        <Button variant="secondary" onClick={handleLogout}>
          Log Out
        </Button>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bybit (auto-verified)                                              */
/* ------------------------------------------------------------------ */
function BybitSection({
  connected,
  bybitUid,
  onConnected,
}: {
  connected: boolean;
  bybitUid: string | null;
  onConnected: () => Promise<void>;
}) {
  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeOpen, setChangeOpen] = useState(false);

  // Verify a Bybit UID; returns an error message or null on success.
  const verify = async (value: string): Promise<string | null> => {
    const res = await fetch("/api/bybit/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bybitUid: value }),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!data?.success) {
      return (
        data?.message ??
        "UID not found. Make sure you signed up via our referral link."
      );
    }
    await onConnected();
    return null;
  };

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
      const err = await verify(trimmed);
      if (err) setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard
      title="Bybit Connection"
      badge={connected ? <Badge tone="brand">Premium</Badge> : null}
    >
      {connected ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-up">Connected</p>
          {bybitUid && <p className="text-xs text-muted">UID: {bybitUid}</p>}
          <p className="text-sm text-muted">
            You have full access to all news &amp; disclosures.
          </p>
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="self-start text-xs text-brand hover:underline"
          >
            Change UID
          </button>
          <ChangeUidModal
            open={changeOpen}
            onClose={() => setChangeOpen(false)}
            exchangeName="Bybit"
            manual={false}
            onSubmit={verify}
          />
        </div>
      ) : (
        <>
          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            <Input
              label="Bybit UID"
              name="bybitUid"
              value={uid}
              onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 12345678"
            />
            {error && <p className="text-xs text-down">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Connecting…" : "Connect & Unlock Premium"}
            </Button>
          </form>
          <UidGuide exchange="Bybit" />
        </>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Binance (manual approval)                                          */
/* ------------------------------------------------------------------ */
function BinanceSection({
  status,
  binanceUid,
  onSubmitted,
}: {
  status: "not_applied" | "pending" | "approved" | "rejected";
  binanceUid: string | null;
  onSubmitted: () => Promise<void>;
}) {
  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Allow re-entering the UID form from pending/rejected states.
  const [editing, setEditing] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  // Submit a Binance UID (→ pending); returns an error message or null.
  const connect = async (value: string): Promise<string | null> => {
    const res = await fetch("/api/binance/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binanceUid: value }),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!data?.success) {
      return data?.message ?? "Submission failed. Please try again.";
    }
    await onSubmitted();
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = uid.trim();
    if (!trimmed) {
      setError("Please enter your Binance UID.");
      return;
    }
    setSubmitting(true);
    try {
      const err = await connect(trimmed);
      if (err) {
        setError(err);
        return;
      }
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const renderForm = (cta: string) => (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        label="Binance UID"
        name="binanceUid"
        value={uid}
        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        placeholder="e.g. 123456789"
      />
      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : cta}
      </Button>
    </form>
  );

  const badge =
    status === "approved" ? (
      <Badge tone="brand">Premium</Badge>
    ) : status === "pending" ? (
      <Badge tone="neutral">Under review</Badge>
    ) : null;

  return (
    <SectionCard title="Binance Connection" badge={badge}>
      {status === "approved" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-up">Approved ✅</p>
          {binanceUid && <p className="text-xs text-muted">UID: {binanceUid}</p>}
          <p className="text-sm text-muted">
            You have full access to all news &amp; disclosures.
          </p>
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="self-start text-xs text-brand hover:underline"
          >
            Change UID
          </button>
          <ChangeUidModal
            open={changeOpen}
            onClose={() => setChangeOpen(false)}
            exchangeName="Binance"
            manual
            onSubmit={connect}
          />
        </div>
      ) : status === "pending" && !editing ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Under review</p>
          <p className="text-sm text-muted">
            Your Binance UID{binanceUid ? ` (${binanceUid})` : ""} is being
            reviewed by our team (usually within 24 hours).
          </p>
          <button
            type="button"
            onClick={() => {
              setUid("");
              setEditing(true);
            }}
            className="self-start text-xs text-brand hover:underline"
          >
            Change UID
          </button>
        </div>
      ) : status === "rejected" && !editing ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-down">Rejected</p>
          <p className="text-sm text-muted">
            We couldn&apos;t verify your Binance referral. Make sure you signed
            up via our referral link, then re-apply.
          </p>
          <Button onClick={() => { setUid(""); setEditing(true); }}>
            Re-apply
          </Button>
        </div>
      ) : (
        <>
          {renderForm(status === "rejected" ? "Re-apply" : "Submit & Apply")}
          <UidGuide exchange="Binance" />
        </>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                        */
/* ------------------------------------------------------------------ */
function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function UidGuide({ exchange }: { exchange: string }) {
  return (
    <div className="mt-2 rounded-lg border border-border bg-background p-4">
      <p className="mb-2 text-xs font-semibold text-foreground">
        How to find your {exchange} UID
      </p>
      <ol className="flex flex-col gap-1 text-xs text-muted">
        <li>1. Open the {exchange} app</li>
        <li>2. Tap your profile icon</li>
        <li>3. Copy the UID below your name</li>
      </ol>
    </div>
  );
}
