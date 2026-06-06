/**
 * Canonical site URL. Override with NEXT_PUBLIC_SITE_URL in the environment
 * (e.g. preview deployments); falls back to the production domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kstockhelper.com"
).replace(/\/$/, "");

export const SITE_NAME = "K-Stock Helper";
export const SITE_TITLE = "K-Stock Helper - Korean Stock News in English";
export const SITE_DESCRIPTION =
  "Real-time Korean stock market news and disclosures in English for global investors";
