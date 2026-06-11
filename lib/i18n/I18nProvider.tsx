"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { SupportedLocale } from "./config";
import type { Dictionary } from "./dictionaries";
import { translate, type TranslateFn } from "./translate";

interface I18nContextValue {
  locale: SupportedLocale;
  t: TranslateFn;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provides the active locale + a memoized `t()` to the client tree. The locale
 * and dictionary are resolved on the server and passed in, so the client never
 * re-fetches or re-resolves them.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: SupportedLocale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key, vars) => translate(dictionary, key, vars),
    }),
    [locale, dictionary]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
