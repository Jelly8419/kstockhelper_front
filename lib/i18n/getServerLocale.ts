import { getLocale } from "next-intl/server";
import { type ContentLocale, type SupportedLocale } from "./config";
import { normalizeLocale, resolveContentLocale } from "./normalize";

/**
 * Read the active UI locale in a Server Component / route handler.
 *
 * Sourced from next-intl's URL-based routing (`getLocale()`), normalized as a
 * safety gate. Async because next-intl resolves the locale per request.
 */
export async function getServerLocale(): Promise<SupportedLocale> {
  return normalizeLocale(await getLocale());
}

/**
 * Read the active news/disclosure CONTENT locale. Derived from the UI locale:
 * a `ContentLocale` when content is translated for it, or `null` to use the
 * English source (covers `en` and UI-only locales like `es`/`id`).
 */
export async function getServerContentLocale(): Promise<ContentLocale | null> {
  return resolveContentLocale(await getServerLocale());
}
