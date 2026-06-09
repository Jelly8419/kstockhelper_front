/**
 * Admin API types — mirror the backend spec (admin_api_spec.md).
 * Values are intentionally the backend's wire format (UPPERCASE tiers,
 * lowercase statuses) so proxy routes pass them through unchanged.
 */

export type MembershipTier = "GENERAL" | "PREMIUM";

/** Member account status (active = normal, inactive = withdrawn). */
export type MemberStatus = "active" | "inactive";

export type Exchange = "BINANCE" | "BYBIT";

/** Per-exchange UID review status. */
export type UidStatus = "not_applied" | "pending" | "approved" | "rejected";

/** Activity log event types (PRD 4.8 / spec §3). */
export type ActivityLogType =
  | "UID_APPLIED"
  | "UID_APPROVED"
  | "UID_REJECTED"
  | "UID_CHANGE_REQUESTED"
  | "TIER_CHANGED"
  | "PREMIUM_AUTO_APPROVED"
  | "ADMIN_MANUAL_CHANGE";

/** Row in the member list (GET /users). */
export interface AdminUserListItem {
  userId: string;
  email: string;
  membershipTier: MembershipTier;
  /** Approved exchanges only (pending/rejected/not-applied excluded). */
  approvedExchanges: Exchange[];
  createdAt: string;
  status: MemberStatus;
}

export interface ExchangeUid {
  exchange: Exchange;
  uid: string | null;
  status: UidStatus;
}

export interface ActivityLog {
  type: ActivityLogType;
  exchange: Exchange | null;
  uid: string | null;
  fromTier: MembershipTier | null;
  toTier: MembershipTier | null;
  createdAt: string;
}

/** Full member detail (GET /users/{userId}). */
export interface AdminUserDetail {
  userId: string;
  email: string;
  createdAt: string;
  membershipTier: MembershipTier;
  status: MemberStatus;
  exchangeUids: ExchangeUid[];
  /** Newest-first. */
  activityLogs: ActivityLog[];
  adminMemo: string | null;
}

/** Standard success/failure envelope for write endpoints. */
export interface AdminMutationResult {
  success: boolean;
  message: string;
}
