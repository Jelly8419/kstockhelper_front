"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { LegalContent } from "@/components/legal/LegalContent";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legal/content";

type Step = "email" | "code" | "password";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
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
      setNotice(`A 6-digit code was sent to ${email}.`);
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
      setNotice("A new code was sent.");
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
      setError(`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
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

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <p className="text-xs text-muted">
        Step {step === "email" ? 1 : step === "code" ? 2 : 3} of 3
      </p>

      {step === "email" && (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {notice && <p className="text-xs text-muted">{notice}</p>}
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send Verification Code"}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <Input
            label="Verification Code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the 6-digit code"
          />
          {notice && <p className="text-xs text-muted">{notice}</p>}
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Verifying…" : "Verify Code"}
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
              ← Change email
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={loading}
              className="text-brand hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={setAccountPassword} className="flex flex-col gap-4">
          <Input
            label="Password (8–16 characters)"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          {/* Legal consent: expand the arrow to read the full text inline. */}
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
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
