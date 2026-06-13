import type { HotNewsStatus, RelatedStock } from "@/types/hotNews";

/**
 * Max Hot in Korea items fetched for the carousel. There is no registration
 * cap (PRD 4.4), so this is a safety upper bound for the home query.
 */
export const HOT_NEWS_LIMIT = 20;

/** Selectable related stocks (PRD 4.3) — multi-select, at least one required. */
export const RELATED_STOCK_OPTIONS: RelatedStock[] = [
  "samsung",
  "skhynix",
  "hyundai",
];

/** Valid publish states (PRD 4.4). */
export const HOT_NEWS_STATUSES: HotNewsStatus[] = [
  "scheduled",
  "published",
  "hidden",
];

/** Korean status labels for the admin UI. */
export const HOT_NEWS_STATUS_LABEL: Record<HotNewsStatus, string> = {
  scheduled: "예약",
  published: "게시",
  hidden: "숨김",
};

/** Badge tones for each status (matches the admin Badge component tones). */
export const HOT_NEWS_STATUS_TONE: Record<
  HotNewsStatus,
  "neutral" | "up" | "down" | "brand"
> = {
  scheduled: "neutral",
  published: "up",
  hidden: "down",
};
