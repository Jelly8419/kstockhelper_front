"use client";

import { useLocale } from "next-intl";
import { useMemo } from "react";
import { normalizeLocale } from "./normalize";
import { getDictionary } from "./dictionaries";
import { translate, type TranslateFn } from "./translate";
import type { SupportedLocale } from "./config";

/**
 * Access the active locale and translation function in a Client Component.
 *
 * Adapter over next-intl: the active locale comes from next-intl's URL-based
 * routing (`useLocale`), while string resolution still goes through our
 * `translate()` engine so the PRD fallback chain (locale → en → "") and the
 * `t(key, vars)` call signature are preserved across the codebase.
 */
export function useTranslation(): { locale: SupportedLocale; t: TranslateFn } {
  const raw = useLocale();
  const locale = normalizeLocale(raw);

  const t = useMemo<TranslateFn>(() => {
    const dict = getDictionary(locale);
    return (key, vars) => translate(dict, key, vars);
  }, [locale]);

  return { locale, t };
}
