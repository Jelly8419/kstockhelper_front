/** Format a number with thousands separators (locale-aware). */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Format a percent change with sign, e.g. +1.23% / -0.45%. */
export function formatChangeRate(rate: number): string {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

/** Format an absolute change with sign. */
export function formatChange(change: number, fractionDigits = 0): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${formatNumber(change, fractionDigits)}`;
}

/** Direction of a change for styling. */
export function changeDirection(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

/**
 * Format an ISO timestamp as "YYYY-MM-DD, HH:mm" in the user's local timezone.
 * PRD: registered time shown per user timezone.
 */
export function formatRegisteredTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}, ${hh}:${min}`;
}
