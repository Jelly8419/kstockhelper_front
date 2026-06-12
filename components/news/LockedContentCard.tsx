"use client";

import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Locked premium-content region for non-entitled viewers (guest / free).
 *
 * Renders blurred placeholder bars (the real summary/key-points are never sent
 * to non-premium clients — gated in the DB view — so we can only show a dummy
 * skeleton) with a centered lock card on top. The card's copy and CTAs branch
 * by tier:
 *   - guest → "create an account" (Sign Up primary, Log In secondary)
 *   - free  → "upgrade to Premium" (Upgrade primary)
 */
export function LockedContentCard({ tier }: { tier: "guest" | "free" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Blurred placeholder skeleton — purely decorative, no real content. It
          is tall enough to sit behind the centered card without being clipped. */}
      <div
        className="select-none p-6 blur-[5px]"
        aria-hidden="true"
      >
        {/* Solid color tokens (not `/opacity` modifiers): the theme's
            foreground/border vars are hex, so Tailwind opacity modifiers
            resolve to transparent. `bg-muted` is the visible placeholder grey. */}
        <div className="mb-4 h-4 w-28 rounded bg-muted" />
        <div className="flex flex-col gap-3">
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-10/12", "w-3/4", "w-full", "w-5/6"].map(
            (w, i) => (
              <div key={i} className={`h-3 ${w} rounded bg-muted`} />
            )
          )}
        </div>
      </div>

      {/* Centered lock card overlay. */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-[rgba(10,12,16,0.92)] px-6 py-7 text-center shadow-xl">
          <LockIcon />
          {tier === "guest" ? <GuestCta /> : <FreeCta />}
        </div>
      </div>
    </div>
  );
}

function GuestCta() {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="text-base font-semibold text-foreground">
        {t("newsGate.guestTitle")}
      </h2>
      <p className="text-sm text-muted">{t("newsGate.guestBody")}</p>
      <Link href="/signup" className="mt-1 w-full">
        <Button className="w-full">{t("newsGate.guestSignupCta")}</Button>
      </Link>
      <Link href="/login" className="text-sm text-brand hover:underline">
        {t("newsGate.guestLoginCta")}
      </Link>
    </>
  );
}

function FreeCta() {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="text-base font-semibold text-foreground">
        {t("newsGate.premiumTitle")}
      </h2>
      <p className="text-sm text-muted">{t("newsGate.premiumBody")}</p>
      <Link href="/settings" className="mt-1 w-full">
        <Button className="w-full">{t("newsGate.premiumUpgradeCta")}</Button>
      </Link>
    </>
  );
}

/** Padlock glyph (inline SVG — the project ships no icon library). */
function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
