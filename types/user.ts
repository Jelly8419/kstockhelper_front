/**
 * Access tier used to gate content (3 levels):
 *  - guest:   not logged in
 *  - free:    logged in, tier != 'premium' → preview only
 *  - premium: DB tier = 'premium' → full access. The backend promotes a user to
 *             'premium' on Bybit link or Binance UID approval; the frontend and
 *             the DB is_premium() gate both check tier='premium' only.
 */
export type UserTier = "guest" | "free" | "premium";

/** Binance connection review status (manual approval). */
export type BinanceStatus =
  | "not_applied"
  | "pending"
  | "approved"
  | "rejected";

/**
 * PayPal subscription status (restricted-region Premium path). Display-only —
 * Premium gating itself stays driven by `tier='premium'`, which the backend
 * keeps in sync with these values:
 *  - none:      no subscription (or ended)            → tier 'free'
 *  - active:    subscribed and renewing               → tier 'premium'
 *  - canceling: cancelled, Premium kept until period end (next billing date)
 *                                                      → tier 'premium'
 *  - past_due:  last auto-payment failed (immediate Basic, no grace period)
 *                                                      → tier 'free'
 */
export type SubscriptionStatus = "none" | "active" | "canceling" | "past_due";

/** Billing cycle the user is on: trial = first month $1, regular = $4.9/mo. */
export type SubscriptionPlan = "trial" | "regular";

export interface SessionUser {
  id: string;
  email: string;
  tier: UserTier;
  /** Connected Bybit UID, if any (auto-verified). */
  bybitUid: string | null;
  /** Submitted Binance UID, if any (manually reviewed). */
  binanceUid: string | null;
  binanceStatus: BinanceStatus;
  /** PayPal subscription status (restricted regions). */
  subscriptionStatus: SubscriptionStatus;
  /** Billing cycle, or null when not subscribed. */
  subscriptionPlan: SubscriptionPlan | null;
  /** Next billing date / Premium-until date (ISO string), or null. */
  nextBillingAt: string | null;
  /** Whether the most recent payment failed (drives the failure notice). */
  lastPaymentFailed: boolean;
}
