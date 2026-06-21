"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { errorKeyForCode } from "@/lib/i18n/errorCodes";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { ChangeUidModal } from "./ChangeUidModal";
import { SectionCard } from "./SectionCard";
import { SubscriptionStatusCard } from "@/components/subscription/SubscriptionStatusCard";
import { maskUid } from "@/lib/utils/format";

export function SettingsClient() {
  const router = useRouter();
  const auth = useAuth();
  const { t } = useTranslation();
  const restricted = useRestrictedRegion();
  const track = useTrackEvent();
  const { tier, email, bybitUid, binanceUid, binanceStatus, isLoading } = auth;

  // Route guard: redirect guests to login once auth has resolved.
  useEffect(() => {
    if (!isLoading && tier === "guest") {
      router.replace("/login");
    }
  }, [isLoading, tier, router]);

  // Log the page view once the (non-guest) settings page is actually shown.
  const pageVisible = !isLoading && tier !== "guest";
  useEffect(() => {
    if (pageVisible) track("mypage_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisible]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading || tier === "guest") {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Account */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">
          {t("settings.account")}
        </h2>
        <p className="text-sm text-foreground">{email}</p>
      </section>

      {restricted ? (
        // Restricted regions: hide exchange connection cards entirely; show the
        // PayPal subscription status card instead (badge, billing date, cancel).
        <SubscriptionStatusCard />
      ) : (
        <>
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
        </>
      )}

      {/* Logout */}
      <section>
        <Button variant="secondary" onClick={handleLogout}>
          {t("settings.logOut")}
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
  const { t } = useTranslation();
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
      code?: string | null;
      message?: string;
    } | null;
    if (!data?.success) {
      // Prefer the backend `code` → i18n key; fall back to message, then default.
      const key = errorKeyForCode(data?.code);
      const localized = key ? t(key) : "";
      return localized || data?.message || t("settings.errorBybitReferral");
    }
    await onConnected();
    return null;
  };

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = uid.trim();
    if (!trimmed) {
      setError(t("settings.errorBybitUidRequired"));
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
      title={t("settings.bybitConnection")}
      badge={
        connected ? <Badge tone="brand">{t("settings.premium")}</Badge> : null
      }
    >
      {connected ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-up">
            {t("settings.connected")}
          </p>
          {bybitUid && (
            <p className="text-xs text-muted">
              {t("settings.uidValue", { uid: maskUid(bybitUid) })}
            </p>
          )}
          <p className="text-sm text-muted">{t("settings.fullAccess")}</p>
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="self-start text-xs text-brand hover:underline"
          >
            {t("settings.changeUid")}
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
              label={t("settings.bybitUidLabel")}
              name="bybitUid"
              value={uid}
              onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder={t("settings.bybitUidPlaceholder")}
            />
            {error && <p className="text-xs text-down">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? t("settings.connecting")
                : t("settings.connectUnlock")}
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
  const { t } = useTranslation();
  const track = useTrackEvent();
  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Allow re-entering the UID form from pending/rejected states.
  const [editing, setEditing] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  // Submit a Binance UID (→ pending); returns an error message or null.
  const connect = async (value: string): Promise<string | null> => {
    track("uid_apply_clicked", { exchange: "binance" });
    const res = await fetch("/api/binance/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binanceUid: value }),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      code?: string | null;
      message?: string;
    } | null;
    if (!data?.success) {
      const key = errorKeyForCode(data?.code);
      const localized = key ? t(key) : "";
      return localized || data?.message || t("settings.errorSubmitFailed");
    }
    await onSubmitted();
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = uid.trim();
    if (!trimmed) {
      setError(t("settings.errorBinanceUidRequired"));
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
        label={t("settings.binanceUidLabel")}
        name="binanceUid"
        value={uid}
        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        placeholder={t("settings.binanceUidPlaceholder")}
      />
      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? t("settings.submitting") : cta}
      </Button>
    </form>
  );

  const badge =
    status === "approved" ? (
      <Badge tone="brand">{t("settings.premium")}</Badge>
    ) : status === "pending" ? (
      <Badge tone="neutral">{t("settings.underReview")}</Badge>
    ) : null;

  return (
    <SectionCard title={t("settings.binanceConnection")} badge={badge}>
      {status === "approved" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-up">
            {t("settings.approved")}
          </p>
          {binanceUid && (
            <p className="text-xs text-muted">
              {t("settings.uidValue", { uid: maskUid(binanceUid) })}
            </p>
          )}
          <p className="text-sm text-muted">{t("settings.fullAccess")}</p>
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="self-start text-xs text-brand hover:underline"
          >
            {t("settings.changeUid")}
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
          <p className="text-sm font-medium text-foreground">
            {t("settings.underReview")}
          </p>
          <p className="text-sm text-muted">
            {t("settings.binanceUnderReview", {
              uidSuffix: binanceUid ? ` (${binanceUid})` : "",
            })}
          </p>
          <button
            type="button"
            onClick={() => {
              setUid("");
              setEditing(true);
            }}
            className="self-start text-xs text-brand hover:underline"
          >
            {t("settings.changeUid")}
          </button>
        </div>
      ) : status === "rejected" && !editing ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-down">
            {t("settings.rejected")}
          </p>
          <p className="text-sm text-muted">
            {t("settings.binanceRejected")}
          </p>
          <Button onClick={() => { setUid(""); setEditing(true); }}>
            {t("settings.reapply")}
          </Button>
        </div>
      ) : (
        <>
          {renderForm(
            status === "rejected"
              ? t("settings.reapply")
              : t("settings.submitAndApply")
          )}
          <UidGuide exchange="Binance" />
        </>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                        */
/* ------------------------------------------------------------------ */
function UidGuide({ exchange }: { exchange: string }) {
  const { t } = useTranslation();
  return (
    <div className="mt-2 rounded-lg border border-border bg-background p-4">
      <p className="mb-2 text-xs font-semibold text-foreground">
        {t("settings.uidGuideTitle", { exchange })}
      </p>
      <ol className="flex flex-col gap-1 text-xs text-muted">
        <li>{t("settings.uidGuideStep1", { exchange })}</li>
        <li>{t("settings.uidGuideStep2")}</li>
        <li>{t("settings.uidGuideStep3")}</li>
      </ol>
    </div>
  );
}
