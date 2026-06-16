import type { StockCode } from "@/types/priceGap";

/**
 * Fixed per-stock line colors, shared by the table dot, chart line, and legend
 * so a stock keeps the same color everywhere (PRD §12). These are chart line
 * colors (not the market up/down tokens), matching the mockup: Samsung blue,
 * SK hynix green, Hyundai amber.
 */
export const STOCK_COLORS: Record<StockCode, string> = {
  "005930": "#3b82f6", // Samsung — blue
  "000660": "#22c55e", // SK hynix — green
  "005380": "#f59e0b", // Hyundai — amber
};

/**
 * Gap Tracker line colors by role (PRD §7.9): the Current Gap and Avg Gap lines
 * must be clearly distinct. Current is the emphasis color; Avg is a softer,
 * non-overlapping hue (magenta/pink) so it never blends with the live line.
 */
export const GAP_LINE_COLORS = {
  current: "#3b82f6", // blue — Current Gap (emphasis)
  avg: "#ec4899", // pink — Avg Gap (secondary)
} as const;
