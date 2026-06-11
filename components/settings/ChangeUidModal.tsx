"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  open: boolean;
  onClose: () => void;
  /** "Bybit" | "Binance" */
  exchangeName: string;
  /** Whether re-verification is manual (Binance) or automatic (Bybit). */
  manual: boolean;
  /** Submit the new UID; returns an error message or null on success. */
  onSubmit: (newUid: string) => Promise<string | null>;
}

/**
 * Confirmation + new-UID entry modal for changing an already-connected UID.
 * Warns that changing the UID resets premium access pending re-verification.
 */
export function ChangeUidModal({
  open,
  onClose,
  exchangeName,
  manual,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [uid, setUid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (submitting) return;
    setUid("");
    setError(null);
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = uid.trim();
    if (!trimmed) {
      setError(t("changeUid.errorUidRequired", { exchange: exchangeName }));
      return;
    }
    setSubmitting(true);
    try {
      const err = await onSubmit(trimmed);
      if (err) {
        setError(err);
        return;
      }
      setUid("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={t("changeUid.title", { exchange: exchangeName })}
    >
      <p className="text-sm text-muted">{t("changeUid.intro")}</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground">
        <li>• {t("changeUid.bulletDisablePremium")}</li>
        <li>• {t("changeUid.bulletResetStatus")}</li>
        <li>
          •{" "}
          {manual
            ? t("changeUid.bulletResubmitReview")
            : t("changeUid.bulletResubmitVerify")}
        </li>
      </ul>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        <Input
          label={t("changeUid.newUidLabel", { exchange: exchangeName })}
          value={uid}
          onChange={(v) => setUid(v.replace(/\D/g, ""))}
          placeholder={t("changeUid.newUidPlaceholder")}
        />
        {error && <p className="text-xs text-down">{error}</p>}
        <p className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
          {/* eslint-disable-next-line i18next/no-literal-string -- decorative info glyph */}
          <span aria-hidden>ⓘ</span>{" "}
          {manual ? t("changeUid.infoReview") : t("changeUid.infoVerify")}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={close}
            disabled={submitting}
          >
            {t("changeUid.cancel")}
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? t("changeUid.submitting") : t("changeUid.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* Lightweight inline input (Modal-local to keep label styling consistent). */
function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}
