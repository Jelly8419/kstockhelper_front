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

export interface SessionUser {
  id: string;
  email: string;
  tier: UserTier;
  /** Connected Bybit UID, if any (auto-verified). */
  bybitUid: string | null;
  /** Submitted Binance UID, if any (manually reviewed). */
  binanceUid: string | null;
  binanceStatus: BinanceStatus;
}
