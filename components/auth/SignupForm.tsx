"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Step = "email" | "code" | "password";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

export function SignupForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: send a 6-digit email verification code (OTP).
  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setStep("code");
      setNotice(t("auth.codeSent", { email }));
    } finally {
      setLoading(false);
    }
  };

  // Resend the code without leaving the code step.
  const resendCode = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setNotice(t("auth.codeResent"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the OTP code → creates the session.
  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "email",
      });
      if (error) {
        setError(error.message);
        return;
      }
      setStep("password");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set the account password (8–16 chars) on the now-authenticated user.
  const setAccountPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(
        t("auth.errorPasswordLength", { min: PASSWORD_MIN, max: PASSWORD_MAX })
      );
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.errorPasswordMismatch"));
      return;
    }
    if (!agreed) {
      setError(t("auth.errorAgreeRequired"));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      // Record legal consent on the profile row (created by the signup trigger).
      // Version = the document's "Last Updated" date.
      if (user) {
        const now = new Date().toISOString();
        await supabase
          .from("users")
          .update({
            terms_agreed_at: now,
            terms_version: TERMS_OF_SERVICE.lastUpdated,
            privacy_agreed_at: now,
            privacy_version: PRIVACY_POLICY.lastUpdated,
          })
          .eq("id", user.id);
      }

      // New account → land on the guide page.
      router.push("/guide");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <p className="text-xs text-muted">
        {t("auth.stepOf", {
          current: step === "email" ? 1 : step === "code" ? 2 : 3,
        })}
      </p>

      {step === "email" && (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <Input
            label={t("auth.email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
          />
          {/* Legal consent — collected up front, gates both sign-up methods. */}
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

          {notice && <p className="text-xs text-muted">{notice}</p>}
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !agreed}>
            {loading ? t("auth.sending") : t("auth.sendCode")}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">{t("common.or")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Google sign-up. Disabled until consent is given; the consent flag
              is carried through OAuth so the callback skips the /consent gate. */}
          <div className={agreed ? "" : "pointer-events-none opacity-50"}>
            <GoogleButton next="/" consentGiven={agreed} />
          </div>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <Input
            label={t("auth.verificationCode")}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("auth.verificationCodePlaceholder")}
          />
          {notice && <p className="text-xs text-muted">{notice}</p>}
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? t("auth.verifying") : t("auth.verifyCode")}
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                setNotice(null);
              }}
              className="text-muted hover:text-foreground"
            >
              {t("auth.changeEmail")}
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={loading}
              className="text-brand hover:underline disabled:opacity-50"
            >
              {t("auth.resendCode")}
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={setAccountPassword} className="flex flex-col gap-4">
          <Input
            label={t("auth.passwordWithRule")}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
          />
          <Input
            label={t("auth.confirmPassword")}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
          />
          {/* Consent was already collected in step 1. */}
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-brand hover:underline">
          {t("auth.logIn")}
        </Link>
      </p>
    </div>
  );
}
