"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { errorKeyForCode } from "@/lib/i18n/errorCodes";

type Exchange = "bybit" | "binance";

interface Props {
  exchange: Exchange;
  /** Whether the user is logged in (controls login redirect). */
  loggedIn: boolean;
  /** Called after a successful submit (e.g. auth.refresh). */
  onSuccess?: () => void | Promise<void>;
  /** Accent color theme. */
  accent?: "binance" | "bybit";
}

const CONFIG = {
  bybit: {
    labelKey: "connect.bybitUidLabel",
    endpoint: "/api/bybit/verify",
    field: "bybitUid",
    doneKey: "connect.bybitDoneTitle",
    exchangeName: "Bybit",
  },
  binance: {
    labelKey: "connect.binanceUidLabel",
    endpoint: "/api/binance/connect",
    field: "binanceUid",
    doneKey: "connect.binanceDoneTitle",
    exchangeName: "Binance",
  },
} as const;

const ACCENT_BTN: Record<NonNullable<Props["accent"]>, string> = {
  binance: "bg-[#f0b90b] text-black hover:bg-[#d9a800]",
  bybit: "bg-[#2e7cf6] text-white hover:bg-[#1f6ae0]",
};

export function ExchangeConnectForm({
  exchange,
  loggedIn,
  onSuccess,
  accent,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = CONFIG[exchange];
  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loggedIn) {
      router.push("/login");
      return;
    }
    const trimmed = uid.trim();
    if (!trimmed) {
      setError(t("connect.uidRequired", { exchange: cfg.exchangeName }));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [cfg.field]: trimmed }),
      });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        code?: string | null;
        message?: string;
      } | null;
      if (!data?.success) {
        // Map by backend `code` (source of truth); fall back to the raw
        // message, then a generic error. Never key off HTTP status.
        const key = errorKeyForCode(data?.code);
        const localized = key ? t(key) : "";
        setError(localized || data?.message || t("connect.submitFailed"));
        return;
      }
      setDone(true);
      await onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="text-sm font-medium text-up">{t(cfg.doneKey)}</p>;
  }

  const btnClass = accent ? ACCENT_BTN[accent] : "";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        label={t(cfg.labelKey)}
        name={cfg.field}
        value={uid}
        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        placeholder={t("connect.uidPlaceholder")}
      />
      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" disabled={submitting} className={btnClass}>
        {submitting ? t("common.submitting") : t("connect.cta")}
      </Button>
    </form>
  );
}
