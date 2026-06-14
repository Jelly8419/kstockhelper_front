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
