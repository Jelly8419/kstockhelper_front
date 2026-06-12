"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      <Input
        label={t("auth.password")}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("auth.passwordPlaceholder")}
      />
      {error && <p className="text-xs text-down">{error}</p>}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? t("auth.signingIn") : t("auth.logIn")}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">{t("common.or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton next="/" />

      <p className="text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="text-brand hover:underline">
          {t("auth.signUp")}
        </Link>
      </p>
    </form>
  );
}
