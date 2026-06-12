import { getLocale } from "next-intl/server";
import { normalizeLocale } from "./normalize";
import { getDictionary } from "./dictionaries";
import { translate, type TranslateFn } from "./translate";
import type { SupportedLocale } from "./config";

/**
 * Server-side counterpart to `useTranslation` (PRD §8, §10.4).
 *
 * Adapter over next-intl: the active locale comes from next-intl's URL routing
 * (`getLocale()`), while string resolution stays in our `translate()` engine so
 * the `locale → en → ""` fallback and the `t(key, vars)` signature are
 * preserved. Async because next-intl resolves the locale per request.
 *
 * Named `getAppTranslations` to avoid colliding with next-intl's own
 * `getTranslations` server export.
 */
export async function getAppTranslations(): Promise<{
  locale: SupportedLocale;
  t: TranslateFn;
}> {
  const locale = normalizeLocale(await getLocale());
  const dict = getDictionary(locale);
  const t: TranslateFn = (key, vars) => translate(dict, key, vars);
  return { locale, t };
}
