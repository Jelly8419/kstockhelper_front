import { headers } from "next/headers";
import Link from "next/link";
import {
  ADMIN_BASE_PATH,
  ADMIN_LOGIN_PATH,
  PATHNAME_HEADER,
} from "@/lib/admin/constants";
import { LogoutButton } from "./LogoutButton";

/**
 * Admin console chrome (header + nav). The login page renders bare (no chrome)
 * so it isn't shown to unauthenticated visitors; every other console page gets
 * the full shell.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = headers().get(PATHNAME_HEADER) ?? "";
  const isLogin = pathname === ADMIN_LOGIN_PATH;

  if (isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href={`${ADMIN_BASE_PATH}/users`}
            className="text-sm font-semibold text-foreground"
          >
            K-Stock Helper{" "}
            <span className="text-muted">Admin</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href={`${ADMIN_BASE_PATH}/users`}
              className="text-sm text-muted hover:text-foreground"
            >
              회원관리
            </Link>
            <Link
              href={`${ADMIN_BASE_PATH}/premium-applications`}
              className="text-sm text-muted hover:text-foreground"
            >
              프리미엄 회원 신청 관리
            </Link>
            <Link
              href={`${ADMIN_BASE_PATH}/hot-news`}
              className="text-sm text-muted hover:text-foreground"
            >
              Korean&apos;s Hot News
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
