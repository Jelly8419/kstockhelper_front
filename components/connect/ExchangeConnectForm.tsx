"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    label: "Bybit UID",
    endpoint: "/api/bybit/verify",
    field: "bybitUid",
    cta: "Submit & Apply",
  },
  binance: {
    label: "Binance UID",
    endpoint: "/api/binance/connect",
    field: "binanceUid",
    cta: "Submit & Apply",
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
      setError(`Please enter your ${exchange === "bybit" ? "Bybit" : "Binance"} UID.`);
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
        message?: string;
      } | null;
      if (!data?.success) {
        setError(data?.message ?? "Submission failed. Please try again.");
        return;
      }
      setDone(true);
      await onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm font-medium text-up">
        Submitted! {exchange === "bybit" ? "Premium unlocked." : "Under review."}
      </p>
    );
  }

  const btnClass = accent ? ACCENT_BTN[accent] : "";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        label={cfg.label}
        name={cfg.field}
        value={uid}
        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        placeholder="e.g. 123456789"
      />
      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" disabled={submitting} className={btnClass}>
        {submitting ? "Submitting…" : cfg.cta}
      </Button>
    </form>
  );
}
