"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Step = "email" | "code" | "password";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: send an email OTP (verification code).
  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the OTP code.
  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
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

  // Step 3: set the account password (8–16 chars).
  const setAccountPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
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
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the code sent to your email"
          />
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Verifying…" : "Verify Code"}
          </Button>
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
          {error && <p className="text-xs text-down">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
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
