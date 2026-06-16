"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import {
  localeDisplayNames,
  supportedUiLocales,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * GNB language selector (PRD §9). Lists `supportedUiLocales` by their native
 * names. Selecting a locale navigates to the same page under the new locale
 * prefix (`/vi/...`); next-intl updates the URL and persists its `NEXT_LOCALE`
 * cookie so the choice sticks on the next root visit.
 */
export function LocaleSwitcher() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
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

    // Navigate to the same page under the new locale. Passing `params` keeps
    // dynamic segments (e.g. /news/[id]) intact. next-intl updates the URL
    // prefix and persists its NEXT_LOCALE cookie.
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params shape is route-dependent; next-intl accepts it.
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("gnb.languageLabel")}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
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
