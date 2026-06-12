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

/**
 * Mask a UID for display, keeping the first and last 2 characters visible.
 * e.g. "123456789" -> "12*****89". Short UIDs (<=4 chars) are fully masked.
 */
export function maskUid(uid: string): string {
  if (uid.length <= 4) return "*".repeat(uid.length);
  return uid.slice(0, 2) + "*".repeat(uid.length - 4) + uid.slice(-2);
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
