import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getDictionary } from "./dictionaries";
import type { SupportedLocale } from "./config";

/**
 * Per-request next-intl config. Validates the requested locale and supplies the
 * message dictionary for it. Messages come from `getDictionary` — the same
 * `locales/{locale}.json` files used by the existing translation layer, so
 * there is one source of truth.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: getDictionary(locale as SupportedLocale) as Record<
      string,
      unknown
    >,
  };
});
