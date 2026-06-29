"use client";

import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";

export function Gnb() {
  const { tier, email, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6">
        {/* Left: logo + wordmark → home, plus primary nav */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
              <Image
                src="/logo-k-symbol.png"
                alt="K-Stock Helper"
                width={32}
                height={32}
                className="h-full w-full"
                priority
              />
            </span>
            {/* Brand name — not translated. */}
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <span className="text-base font-semibold tracking-tight text-foreground">
              K-Stock Helper
            </span>
          </Link>

          {/* Real Estate entry point (SEO PRD §9 internal link). Hidden on
              narrow screens where the label would crowd the auth actions. */}
          <Link
            href={REAL_ESTATE_HOME_PATH}
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground md:inline"
          >
            {t("gnb.realEstate")}
          </Link>
        </div>

        {/* Right: language selector + auth actions */}
        <nav className="flex items-center gap-2">
          <LocaleSwitcher />
          {isLoading ? null : tier !== "guest" ? (
            <>
              {email && (
                <Link
                  href="/settings"
                  className="hidden max-w-[180px] truncate text-sm text-muted hover:text-foreground sm:inline"
                >
                  {email}
                </Link>
              )}
              {/* Mobile: email link is hidden, so expose Settings via an icon. */}
              <Link
                href="/settings"
                aria-label={t("gnb.settings")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-foreground sm:hidden"
              >
                <SettingsIcon />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t("gnb.logOut")}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("gnb.logIn")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  {t("gnb.signUp")}
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/** Gear icon for the mobile Settings link. */
function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
