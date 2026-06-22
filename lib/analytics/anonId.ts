/**
 * Anonymous visitor id for analytics.
 *
 * A per-browser UUID stored in localStorage, attached to every event so we can
 * count unique visitors (incl. guests, who have no user_id) and group a single
 * person's repeated views / refreshes. This is NOT tied to identity — it's a
 * random id, cleared if the user clears site data. Preferred over IP (shared on
 * one network, changes on mobile/VPN, and is PII).
 */

const STORAGE_KEY = "ksh_anon_id";

/** Generate a UUID, falling back when crypto.randomUUID is unavailable. */
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (older browsers): timestamp + random, varied enough for analytics.
  return `a-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e9
  ).toString(36)}`;
}

/**
 * Read the visitor's anon id, creating and persisting one on first call.
 * Returns null during SSR or if localStorage is unavailable (private mode etc.).
 */
export function getAnonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked (private mode / cookies disabled) — skip silently.
    return null;
  }
}
