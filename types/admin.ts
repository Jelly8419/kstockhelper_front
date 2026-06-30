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

/** Premium application review status (applications.status). */
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * A premium-membership application row (GET /premium-applications).
 *
 * The list only returns PENDING applications. Bybit is auto-approved via the
 * affiliate API, so in practice these are Binance applications — but the
 * exchange field stays typed as Exchange to tolerate the rare manual Bybit
 * exception case the backend may surface.
 */
export interface PremiumApplication {
  applicationId: string;
  userId: string;
  email: string;
  exchange: Exchange;
  uid: string;
  membershipTier: MembershipTier;
  status: ApplicationStatus;
  appliedAt: string;
}

/* ------------------------------------------------------------------ */
/* Real Estate purchase requests (Admin — 부동산 구매 요청 관리)        */
/* (프론트연동가이드_부동산_API.md §B)                                  */
/* ------------------------------------------------------------------ */

/** Request handling status (backend `0015`): 접수 / 답변완료 only. */
export type RealEstateRequestStatus = "RECEIVED" | "ANSWERED";

/** Property type submitted in the form. */
export type RealEstatePropertyType =
  | "apartment"
  | "officetel"
  | "other"
  | "not_sure";

/** Row in the request list (GET /real-estate-requests). created_at desc. */
export interface RealEstateRequestListItem {
  id: string;
  createdAt: string;
  countryOfResidence: string;
  email: string;
  currentlyInKorea: boolean;
  status: RealEstateRequestStatus;
}

/** Full request detail (GET /real-estate-requests/{id}). */
export interface RealEstateRequestDetail {
  id: string;
  createdAt: string;
  email: string;
  countryOfResidence: string;
  budgetCurrency: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: RealEstatePropertyType;
  currentlyInKorea: boolean;
  message: string;
  status: RealEstateRequestStatus;
  /** Single overwrite memo (null when unset). */
  adminMemo: string | null;
  userId: string | null;
  locale: string | null;
  countryCode: string | null;
}
