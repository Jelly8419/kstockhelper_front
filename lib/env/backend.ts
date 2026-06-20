/**
 * Single source of truth for the backend host.
 *
 * Previously each proxy carried the full backend URL in its own env var
 * (BYBIT_VERIFY_URL, BINANCE_CONNECT_URL, SUBSCRIPTION_*_URL, …), so the host
 * (e.g. http://localhost:8080) was duplicated across many variables and had to
 * be changed in every one of them per environment.
 *
 * Now a single `BACKEND_API_BASE` holds the host root, and each call site asks
 * for its path via `backendUrl("/api/...")`. The legacy per-endpoint vars are
 * still honored when present (they take precedence), so existing `.env` files
 * keep working and the switch can be rolled out gradually.
 *
 * Server-side only — never expose the backend host to the browser (no
 * NEXT_PUBLIC_ prefix). All callers are route handlers / middleware.
 */

/** Backend host root, e.g. `http://localhost:8080` (no trailing slash needed). */
const BACKEND_API_BASE = process.env.BACKEND_API_BASE ?? "";

/** Join the backend host with a path, normalizing the slash between them. */
function join(base: string, path: string): string {
  if (!base) return "";
  const b = base.replace(/\/+$/, "");
  // Empty path → host root only (no trailing slash); callers that append their
  // own sub-path (e.g. feature flags) then build `${base}/api/...` cleanly.
  if (!path) return b;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Resolve a backend URL for `path` (e.g. "/api/bybit/verify").
 *
 * If `legacyOverride` (a full URL from a per-endpoint env var) is set, it wins —
 * preserving existing deployments. Otherwise the URL is built from
 * `BACKEND_API_BASE`. Returns "" when neither is configured, so callers can keep
 * their existing "not configured → 503 / mock" guards unchanged.
 */
export function backendUrl(path: string, legacyOverride?: string): string {
  if (legacyOverride) return legacyOverride;
  return join(BACKEND_API_BASE, path);
}

/**
 * Resolve a backend BASE (host + prefix) for callers that append their own
 * sub-paths (e.g. PRICE_GAP_API_BASE → `${base}/latest`). Mirrors `backendUrl`'s
 * legacy-override precedence.
 */
export function backendBase(prefix: string, legacyOverride?: string): string {
  if (legacyOverride) return legacyOverride;
  return join(BACKEND_API_BASE, prefix);
}
