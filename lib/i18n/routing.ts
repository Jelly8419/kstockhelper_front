import { defineRouting } from "next-intl/routing";
import { supportedUiLocales, DEFAULT_LOCALE } from "./config";

/**
 * next-intl routing configuration. Drives URL-prefixed locale routing
 * (`/{locale}/...`) and locale detection.
 *
 * - `localePrefix: 'always'` — every URL carries a locale prefix, including the
 *   default (`/en/...`), per the locale-routing policy.
 * - `localeDetection: true` — on the root URL, next-intl picks a locale from the
 *   cookie → Accept-Language. Geo/IP country is layered on in the middleware
 *   (next-intl doesn't read IP country itself).
 *
 * Locales reuse `supportedUiLocales` so UI routing stays in lockstep with the
 * translation set. `ko` is intentionally absent (not user-facing).
 */
export const routing = defineRouting({
  locales: supportedUiLocales,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeDetection: true,
});
