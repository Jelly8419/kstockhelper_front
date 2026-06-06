"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AccessNoticeModal } from "@/components/access/AccessNoticeModal";
import {
  wasAccessNoticeShownToday,
  markAccessNoticeShown,
} from "@/lib/utils/accessNotice";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const goHome = () => {
    router.push("/");
    router.refresh();
  };

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
      // Show the access notice once per day, then continue home.
      if (!wasAccessNoticeShownToday()) {
        markAccessNoticeShown();
        setNoticeOpen(true);
      } else {
        goHome();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-xs text-down">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Log In"}
        </Button>
        <p className="text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="text-brand hover:underline">
            Sign Up
          </Link>
        </p>
      </form>

      <AccessNoticeModal
        open={noticeOpen}
        onClose={() => {
          setNoticeOpen(false);
          goHome();
        }}
      />
    </>
  );
}
