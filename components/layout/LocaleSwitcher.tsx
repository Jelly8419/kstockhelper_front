"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_COOKIE,
  localeDisplayNames,
  supportedUiLocales,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * GNB language selector (PRD §9). Lists `supportedUiLocales` by their native
 * names. Selecting a locale persists it to both localStorage and the
 * `ksh_locale` cookie, then refreshes so the server re-renders in the new
 * locale (the middleware reads the cookie first, §8.1 step 1).
 *
 * Routing here is rewrite-based (the URL has no locale prefix), so we change the
 * locale via cookie + router.refresh() rather than navigation.
 */
export function LocaleSwitcher() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (next: SupportedLocale) => {
    setOpen(false);
    if (next === locale) return;

    try {
      localStorage.setItem(LOCALE_COOKIE, next);
    } catch {
      // localStorage unavailable (private mode) — cookie is the source of truth.
    }
    // 1-year cookie; the middleware reads this first on the next request.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;

    router.refresh();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("gnb.languageLabel")}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <GlobeIcon />
        <span className="hidden sm:inline">{localeDisplayNames[locale]}</span>
        <ChevronIcon />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 max-h-80 w-44 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {supportedUiLocales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                    active ? "text-foreground" : "text-muted"
                  }`}
                >
                  <span>{localeDisplayNames[code]}</span>
                  {active && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
