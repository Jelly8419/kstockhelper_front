/**
 * Shared validation for Hot in Korea create (POST) and status-change (PATCH).
 *
 * Messages mirror the backend contract (프론트연동_KoreansHotNews.md §2.3 / PRD §8)
 * so the frontend's first-pass feedback matches the server's final ruling. The
 * backend is the source of truth for the "scheduledAt in the past" check (server
 * clock); the frontend check is UX-only.
 */

import type { HotNewsStatus, RelatedStock } from "@/types/hotNews";
import { HOT_NEWS_STATUSES, RELATED_STOCK_OPTIONS } from "@/lib/constants/hotNews";

export const HOT_NEWS_MESSAGES = {
  required: "필수 항목을 입력해 주세요.",
  scheduledAtMissing: "예약 게시 일시를 입력해 주세요.",
  scheduledAtPast: "현재 시간 이후의 예약 게시 일시를 선택해 주세요.",
  relatedStockInvalid: "관련 종목 값이 올바르지 않습니다.",
} as const;

function isValidStatus(v: unknown): v is HotNewsStatus {
  return typeof v === "string" && HOT_NEWS_STATUSES.includes(v as HotNewsStatus);
}

function areValidStocks(v: unknown): v is RelatedStock[] {
  return (
    Array.isArray(v) &&
    v.every((s) => RELATED_STOCK_OPTIONS.includes(s as RelatedStock))
  );
}

/**
 * Validate the scheduling fields common to create and status-change.
 * Returns an error message, or null when valid.
 */
export function validateSchedule(
  status: HotNewsStatus,
  scheduledAt: string | null
): string | null {
  if (status !== "scheduled") return null;
  if (!scheduledAt) return HOT_NEWS_MESSAGES.scheduledAtMissing;
  const ts = Date.parse(scheduledAt);
  if (Number.isNaN(ts)) return HOT_NEWS_MESSAGES.scheduledAtMissing;
  if (ts <= Date.now()) return HOT_NEWS_MESSAGES.scheduledAtPast;
  return null;
}

/** Validate a create payload. Returns an error message, or null when valid. */
export function validateCreate(input: {
  title?: unknown;
  content?: unknown;
  relatedStock?: unknown;
  status?: unknown;
  scheduledAt?: unknown;
}): string | null {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";

  if (!title || !content || !isValidStatus(input.status)) {
    return HOT_NEWS_MESSAGES.required;
  }
  if (!Array.isArray(input.relatedStock) || input.relatedStock.length === 0) {
    return HOT_NEWS_MESSAGES.required;
  }
  if (!areValidStocks(input.relatedStock)) {
    return HOT_NEWS_MESSAGES.relatedStockInvalid;
  }

  const scheduledAt =
    typeof input.scheduledAt === "string" ? input.scheduledAt : null;
  return validateSchedule(input.status, scheduledAt);
}

/** Validate a status-change payload. Returns an error message, or null. */
export function validateStatusChange(input: {
  status?: unknown;
  scheduledAt?: unknown;
}): string | null {
  if (!isValidStatus(input.status)) return HOT_NEWS_MESSAGES.required;
  const scheduledAt =
    typeof input.scheduledAt === "string" ? input.scheduledAt : null;
  return validateSchedule(input.status, scheduledAt);
}
