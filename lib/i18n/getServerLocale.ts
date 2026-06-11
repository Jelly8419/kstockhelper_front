import { headers } from "next/headers";
import { LOCALE_HEADER, type SupportedLocale } from "./config";
import { normalizeLocale } from "./normalize";

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
