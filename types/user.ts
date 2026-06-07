/**
 * Access tier used to gate content (3 levels):
 *  - guest:   not logged in
 *  - free:    logged in, no active connection → preview only
 *  - premium: logged in + Bybit connected OR Binance approved → full access
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
