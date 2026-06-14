/**
 * Cookie the middleware sets so client/server components know whether Price Gap
 * Monitor is visible to this visitor (feature flag ON, or whitelisted IP while
 * OFF). Non-httpOnly: read by the home card. "1" = visible, "0" = hidden.
 */
export const PRICE_GAP_VISIBLE_COOKIE = "x-price-gap-visible";

/**
 * Request header the middleware sets so the SAME request's server components
 * (e.g. the home card) can read visibility before the cookie round-trips.
 */
export const PRICE_GAP_VISIBLE_HEADER = "x-price-gap-visible";

