/**
 * Access tier used to gate content (3 levels):
 *  - guest:   not logged in
 *  - free:    logged in, Bybit not connected → preview only
 *  - premium: logged in + Bybit connected (DB tier = 'premium') → full access
 */
export type UserTier = "guest" | "free" | "premium";

export interface SessionUser {
  id: string;
  email: string;
  tier: UserTier;
  /** Connected Bybit UID, if any. */
  bybitUid: string | null;
}
