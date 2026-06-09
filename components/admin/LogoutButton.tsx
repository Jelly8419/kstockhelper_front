"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";

/** Logs the admin out (clears the session cookie) and returns to login. */
export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore — navigate to login regardless.
    }
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="text-sm text-muted hover:text-foreground disabled:opacity-50"
    >
      로그아웃
    </button>
  );
}
