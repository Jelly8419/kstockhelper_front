"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { CountrySelect } from "@/components/realEstate/CountrySelect";
import {
  REAL_ESTATE_CURRENCIES,
  REAL_ESTATE_PROPERTY_TYPES,
  type RealEstatePropertyType,
} from "@/lib/constants/realEstate";

const MESSAGE_MAX = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** BFF route (no locale prefix) that proxies the submission to the backend. */
const REQUEST_API = "/api/real-estate/requests";

interface FieldErrors {
  email?: string;
  country?: string;
  budget?: string;
  propertyType?: string;
  inKorea?: string;
  message?: string;
}

/** Strip thousands separators / spaces and parse to a non-negative integer-ish number. */
function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Format a numeric string with thousands separators as the user types. */
function formatAmount(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return "";
  return Number(digits).toLocaleString("en-US");
}

/**
 * Buying-support request form (PRD "구매 지원 요청 입력 페이지" §7). All fields
 * required; validates on submit; posts to the thin BFF (`/api/real-estate/requests`)
 * which forwards to the backend. On success shows the completion modal and resets
 * the form, staying on the same page (no navigation).
 */
export function RequestForm() {
  const { t } = useTranslation();
  const track = useTrackEvent();

  const [email, setEmail] = useState("");
  // `country` holds the selected ISO code (stored value); CountrySelect manages
  // its own search query internally.
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState<string>(REAL_ESTATE_CURRENCIES[0].code);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [propertyType, setPropertyType] = useState<RealEstatePropertyType | "">("");
  const [inKorea, setInKorea] = useState<"yes" | "no" | "">("");
  const [message, setMessage] = useState("");
  // Honeypot — hidden from users; bots that fill it are silently dropped server-side.
  const [hp, setHp] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const propertyTypeLabel = useMemo(
    () => ({
      apartment: t("realEstate.request.form.propertyTypeApartment"),
      officetel: t("realEstate.request.form.propertyTypeOfficetel"),
      other: t("realEstate.request.form.propertyTypeOther"),
      not_sure: t("realEstate.request.form.propertyTypeNotSure"),
    }),
    [t]
  );

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!EMAIL_RE.test(email.trim())) {
      next.email = t("realEstate.request.form.emailInvalid");
    }
    if (!country) {
      next.country = t("realEstate.request.form.countryRequired");
    }

    const min = parseAmount(budgetMin);
    const max = parseAmount(budgetMax);
    if (min === null || max === null) {
      next.budget = t("realEstate.request.form.budgetRequired");
    } else if (min > max) {
      next.budget = t("realEstate.request.form.budgetMinGreater");
    }

    if (!propertyType) {
      next.propertyType = t("realEstate.request.form.propertyTypeRequired");
    }
    if (!inKorea) {
      next.inKorea = t("realEstate.request.form.inKoreaRequired");
    }
    if (message.trim() === "") {
      next.message = t("realEstate.request.form.messageRequired");
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    track("real_estate_request_submit_clicked");
    setSubmitError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(REQUEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          countryOfResidence: country,
          budgetCurrency: currency,
          budgetMin: parseAmount(budgetMin),
          budgetMax: parseAmount(budgetMax),
          propertyType,
          currentlyInKorea: inKorea === "yes",
          message: message.trim(),
          honeypot: hp,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { success?: boolean }
        | null;

      if (res.ok && data?.success) {
        setDone(true);
        resetForm();
      } else {
        setSubmitError(t("realEstate.request.form.submitError"));
      }
    } catch {
      setSubmitError(t("realEstate.request.form.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setEmail("");
    setCountry("");
    setCurrency(REAL_ESTATE_CURRENCIES[0].code);
    setBudgetMin("");
    setBudgetMax("");
    setPropertyType("");
    setInKorea("");
    setMessage("");
    setErrors({});
  }

  const selectBase =
    "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-brand";

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Email */}
        <Input
          name="email"
          type="email"
          label={`${t("realEstate.request.form.emailLabel")} *`}
          placeholder={t("realEstate.request.form.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        {/* Country of residence (custom searchable dropdown — §5) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {t("realEstate.request.form.countryLabel")} *
          </span>
          <CountrySelect
            value={country}
            onChange={setCountry}
            placeholder={t("realEstate.request.form.countryPlaceholder")}
            // Form is English-only (request-page PRD); kept literal to avoid a new
            // i18n key (which would require a PM translation round before deploy).
            // eslint-disable-next-line i18next/no-literal-string
            emptyLabel="No countries found"
            error={!!errors.country}
          />
          {errors.country && <p className="text-xs text-down">{errors.country}</p>}
        </div>

        {/* Budget range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("realEstate.request.form.budgetLabel")} *
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label={t("realEstate.request.form.budgetLabel")}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`${selectBase} sm:w-56`}
            >
              {REAL_ESTATE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              inputMode="numeric"
              placeholder={t("realEstate.request.form.budgetMinPlaceholder")}
              value={budgetMin}
              onChange={(e) => setBudgetMin(formatAmount(e.target.value))}
              className={`${selectBase} ${errors.budget ? "border-down" : ""}`}
            />
            <input
              inputMode="numeric"
              placeholder={t("realEstate.request.form.budgetMaxPlaceholder")}
              value={budgetMax}
              onChange={(e) => setBudgetMax(formatAmount(e.target.value))}
              className={`${selectBase} ${errors.budget ? "border-down" : ""}`}
            />
          </div>
          {errors.budget ? (
            <p className="text-xs text-down">{errors.budget}</p>
          ) : (
            <p className="text-xs text-muted">{t("realEstate.request.form.budgetHelper")}</p>
          )}
        </div>

        {/* Property type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="re-property" className="text-sm font-medium text-foreground">
            {t("realEstate.request.form.propertyTypeLabel")} *
          </label>
          <select
            id="re-property"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as RealEstatePropertyType)}
            className={`${selectBase} ${errors.propertyType ? "border-down" : ""}`}
          >
            <option value="" disabled>
              {t("realEstate.request.form.propertyTypeLabel")}
            </option>
            {REAL_ESTATE_PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {propertyTypeLabel[pt]}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p className="text-xs text-down">{errors.propertyType}</p>
          )}
        </div>

        {/* Currently in Korea? */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {t("realEstate.request.form.inKoreaLabel")} *
          </span>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((opt) => (
              <label
                key={opt}
                className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                  inKorea === opt
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-surface text-muted hover:bg-surface-hover"
                }`}
              >
                <input
                  type="radio"
                  name="inKorea"
                  value={opt}
                  checked={inKorea === opt}
                  onChange={() => setInKorea(opt)}
                  className="sr-only"
                />
                {opt === "yes"
                  ? t("realEstate.request.form.inKoreaYes")
                  : t("realEstate.request.form.inKoreaNo")}
              </label>
            ))}
          </div>
          {errors.inKorea && <p className="text-xs text-down">{errors.inKorea}</p>}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="re-message" className="text-sm font-medium text-foreground">
            {t("realEstate.request.form.messageLabel")} *
          </label>
          <textarea
            id="re-message"
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder={t("realEstate.request.form.messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand ${
              errors.message ? "border-down" : ""
            }`}
          />
          <div className="flex items-center justify-between">
            {errors.message ? (
              <p className="text-xs text-down">{errors.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted">
              {message.length} / {MESSAGE_MAX}
            </span>
          </div>
        </div>

        {/* Honeypot — visually hidden, off-screen; real users never fill it. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {submitError && <p className="text-sm text-down">{submitError}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting
            ? t("realEstate.request.form.submitting")
            : t("realEstate.request.form.submit")}
        </Button>

        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span aria-hidden="true">🔒</span>
          {t("realEstate.request.form.privacyNote")}
        </p>
      </form>

      <Modal open={done} onClose={() => setDone(false)} title={t("realEstate.request.modal.title")}>
        <p className="mb-5 text-sm text-muted">{t("realEstate.request.modal.description")}</p>
        <Button variant="primary" className="w-full" onClick={() => setDone(false)}>
          {t("realEstate.request.modal.ok")}
        </Button>
      </Modal>
    </>
  );
}
