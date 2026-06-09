"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";

export function AdminLoginForm() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminId.trim(), password }),
      });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!res.ok || !data?.success) {
        setError(data?.message ?? "아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      // Cookie is set server-side; go to the member list.
      router.replace(`${ADMIN_BASE_PATH}/users`);
      router.refresh();
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="아이디"
        name="adminId"
        value={adminId}
        onChange={(e) => setAdminId(e.target.value)}
        autoComplete="username"
        autoFocus
      />
      <Input
        label="비밀번호"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-down">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "로그인 중…" : "로그인"}
      </Button>
    </form>
  );
}
