/**
 * Access tier used to gate content.
 * Simplified to 2 levels: guest (not logged in) / member (logged in).
 *
 * Future: when Bybit/Binance referral lands, `member` can split into
 * member / premium. The DB `tier` column (free/premium) is preserved via
 * `rawTier` for that purpose.
 */
export type UserTier = "guest" | "member";

/** Raw membership tier stored in the DB `users.tier` column. */
export type RawTier = "free" | "premium";

export interface SessionUser {
  id: string;
  email: string;
  /** Simplified access tier used by the UI. */
  tier: UserTier;
  /** Original DB tier (free/premium), kept for future premium gating. */
  rawTier: RawTier | null;
}
