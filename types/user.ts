/** Access tier used to gate premium content. */
export type UserTier = "guest" | "free" | "premium";

export interface SessionUser {
  id: string;
  email: string;
  tier: UserTier;
}
