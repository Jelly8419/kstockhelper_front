/**
 * Client helpers for the PayPal subscription flow (restricted-region Premium).
 *
 * Mirror of lib/premium/waitlist.ts: thin fetch wrappers around the BFF proxies
 * (/api/subscription/*) that return the backend's { success, code, message }
 * envelope. Components map `code` → i18n via errorKeyForCode; `message` is a
 * fallback. Activation is webhook-driven on the backend — these helpers never
 * grant Premium; callers refresh useAuth after returning.
 */

export interface SubscriptionResult {
  success: boolean;
  code: string | null;
  message: string;
}

export interface CreateSubscriptionResult extends SubscriptionResult {
  /** PayPal approval URL to redirect to (present only on success). */
  approvalUrl: string | null;
}

/** Start a PayPal subscription; on success returns the approval URL to redirect to. */
export async function createSubscription(): Promise<CreateSubscriptionResult> {
  try {
    const res = await fetch("/api/subscription/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await res.json().catch(() => null)) as Partial<
      CreateSubscriptionResult
    > | null;
    return {
      success: data?.success === true,
      code: data?.code ?? null,
      message: data?.message ?? "",
      approvalUrl: data?.approvalUrl ?? null,
    };
  } catch {
    return { success: false, code: null, message: "", approvalUrl: null };
  }
}

/** Cancel the user's subscription at period end (Premium kept until next billing). */
export async function cancelSubscription(): Promise<SubscriptionResult> {
  try {
    const res = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await res.json().catch(() => null)) as Partial<
      SubscriptionResult
    > | null;
    return {
      success: data?.success === true,
      code: data?.code ?? null,
      message: data?.message ?? "",
    };
  } catch {
    return { success: false, code: null, message: "" };
  }
}
