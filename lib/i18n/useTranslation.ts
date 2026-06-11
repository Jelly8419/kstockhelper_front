"use client";

import { useContext } from "react";
import { I18nContext } from "./I18nProvider";
import type { SupportedLocale } from "./config";
import type { TranslateFn } from "./translate";

/**
 * Access the active locale and translation function in a Client Component.
 *
 * Must be used under <I18nProvider> (mounted in the root layout). Throws if not,
 * to surface missing-provider bugs early rather than silently returning "".
 */
export function useTranslation(): { locale: SupportedLocale; t: TranslateFn } {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within <I18nProvider>.");
  }
  return ctx;
}
