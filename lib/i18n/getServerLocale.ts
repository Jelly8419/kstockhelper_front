import { headers } from "next/headers";
import {
  LOCALE_HEADER,
  type ContentLocale,
  type SupportedLocale,
} from "./config";
import { normalizeLocale, resolveContentLocale } from "./normalize";

/**
 * Read the active UI locale in a Server Component / route handler.
 *
 * The middleware resolves the locale (5-step priority) and forwards it via the
 * `x-locale` request header; this reads it back and re-normalizes as a safety
 * gate. Defaults to `en` when the header is absent (e.g. requests that skip the
 * middleware).
 */
export function getServerLocale(): SupportedLocale {
  const value = headers().get(LOCALE_HEADER);
  return normalizeLocale(value);
}

/**
 * Read the active news/disclosure CONTENT locale in a Server Component / route
 * handler. Derived from the UI locale (`x-locale`): returns a `ContentLocale`
 * when content is translated for it, or `null` to use the English source.
 */
export function getServerContentLocale(): ContentLocale | null {
  return resolveContentLocale(getServerLocale());
}
