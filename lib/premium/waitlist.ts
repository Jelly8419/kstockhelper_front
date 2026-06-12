/** Result of a Join-Waitlist attempt, mapped to user-facing i18n keys. */
export type WaitlistStatus = "ok" | "already" | "error";

/**
 * Register the current logged-in user on the Premium waitlist via `/api/waitlist`.
 *
 * Returns:
 *  - "ok"      → newly added
 *  - "already" → the user was already on the waitlist
 *  - "error"   → request failed / not authenticated
 *
 * Shared by the restriction modal and the My Page card so both surface the same
 * outcomes. The route enforces auth; callers gate visibility by login state.
 */
export async function joinWaitlist(): Promise<WaitlistStatus> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      status?: WaitlistStatus;
    } | null;

    if (!res.ok || !data?.success) return "error";
    return data.status === "already" ? "already" : "ok";
  } catch {
    return "error";
  }
}
