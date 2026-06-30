/**
 * Presentation helpers mapping backend enum values to Korean labels and
 * Badge tones for the admin UI. Kept in one place so the list and detail
 * screens stay consistent.
 */

import type {
  ActivityLogType,
  Exchange,
  MembershipTier,
  MemberStatus,
  RealEstatePropertyType,
  RealEstateRequestStatus,
  UidStatus,
} from "@/types/admin";

type Tone = "neutral" | "up" | "down" | "brand";

export const TIER_LABEL: Record<MembershipTier, string> = {
  GENERAL: "일반",
  PREMIUM: "프리미엄",
};

export const TIER_TONE: Record<MembershipTier, Tone> = {
  GENERAL: "neutral",
  PREMIUM: "brand",
};

export const STATUS_LABEL: Record<MemberStatus, string> = {
  active: "활성",
  inactive: "비활성",
};

export const STATUS_TONE: Record<MemberStatus, Tone> = {
  active: "up",
  inactive: "down",
};

export const EXCHANGE_LABEL: Record<Exchange, string> = {
  BINANCE: "Binance",
  BYBIT: "Bybit",
};

export const UID_STATUS_LABEL: Record<UidStatus, string> = {
  not_applied: "미신청",
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "거절",
};

export const UID_STATUS_TONE: Record<UidStatus, Tone> = {
  not_applied: "neutral",
  pending: "neutral",
  approved: "up",
  rejected: "down",
};

/* ------------------------------------------------------------------ */
/* Real Estate purchase requests                                       */
/* ------------------------------------------------------------------ */

export const RE_STATUS_LABEL: Record<RealEstateRequestStatus, string> = {
  RECEIVED: "접수",
  ANSWERED: "답변완료",
};

export const RE_STATUS_TONE: Record<RealEstateRequestStatus, Tone> = {
  RECEIVED: "neutral",
  ANSWERED: "up",
};

export const RE_PROPERTY_TYPE_LABEL: Record<RealEstatePropertyType, string> = {
  apartment: "Apartment",
  officetel: "Officetel",
  other: "Other",
  not_sure: "Not sure yet",
};

/** Yes/No label for the "currently in Korea" flag. */
export function formatInKorea(value: boolean): string {
  return value ? "Yes" : "No";
}

/** Budget range cell: `USD 300,000 ~ 500,000` (PRD 13). */
export function formatBudgetRange(
  currency: string,
  min: number,
  max: number
): string {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return `${currency} ${fmt(min)} ~ ${fmt(max)}`;
}

/** Render the approved-exchange list for the table cell (empty → em dash). */
export function formatApprovedExchanges(exchanges: Exchange[]): string {
  if (!exchanges.length) return "—";
  return exchanges.map((e) => EXCHANGE_LABEL[e]).join(", ");
}

/** Human-readable one-line summary for an activity log entry. */
export function describeActivityLog(log: {
  type: ActivityLogType;
  exchange: Exchange | null;
  uid: string | null;
  fromTier: MembershipTier | null;
  toTier: MembershipTier | null;
}): string {
  const ex = log.exchange ? EXCHANGE_LABEL[log.exchange] : null;
  const uid = log.uid ? `UID ${log.uid}` : null;
  const exUid = [ex, uid].filter(Boolean).join(" ");

  switch (log.type) {
    case "UID_APPLIED":
      return `${exUid} 신청`;
    case "UID_APPROVED":
      return `${exUid} 승인`;
    case "UID_REJECTED":
      return `${exUid} 거절`;
    case "UID_CHANGE_REQUESTED":
      return `${exUid} 변경 신청`;
    case "PREMIUM_AUTO_APPROVED":
      return `${exUid} 프리미엄 자동 승인`;
    case "TIER_CHANGED": {
      const from = log.fromTier ? TIER_LABEL[log.fromTier] : "?";
      const to = log.toTier ? TIER_LABEL[log.toTier] : "?";
      return `회원등급 ${from} → ${to}`;
    }
    case "ADMIN_MANUAL_CHANGE": {
      if (log.fromTier && log.toTier) {
        return `관리자 변경: 회원등급 ${TIER_LABEL[log.fromTier]} → ${TIER_LABEL[log.toTier]}`;
      }
      return exUid ? `관리자 변경: ${exUid}` : "관리자 수동 변경";
    }
    default:
      return log.type;
  }
}
