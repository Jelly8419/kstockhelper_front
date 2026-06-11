import { getServerLocale } from "./getServerLocale";
import { getDictionary } from "./dictionaries";
import { translate, type TranslateFn } from "./translate";
import type { SupportedLocale } from "./config";

/**
 * Server-side counterpart to `useTranslation` (PRD §8, §10.4).
 *
 * Reads the active locale (forwarded by the middleware via `x-locale`), loads
 * the matching dictionary, and returns a `t()` bound to it. Use this in Server
 * Components and route handlers; use `useTranslation` in Client Components.
 * Both share the same keys, dictionaries, and `locale → en → ""` fallback.
 */
export function getTranslations(): { locale: SupportedLocale; t: TranslateFn } {
  const locale = getServerLocale();
  const dict = getDictionary(locale);
  const t: TranslateFn = (key, vars) => translate(dict, key, vars);
  return { locale, t };
}
