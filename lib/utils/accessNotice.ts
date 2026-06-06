const STORAGE_KEY = "accessNoticeShownDate";

/** Local date string in YYYY-MM-DD (user timezone). */
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whether the access notice has already been shown today. */
export function wasAccessNoticeShownToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === today();
  } catch {
    return false;
  }
}

/** Mark the access notice as shown today (once-per-day gate). */
export function markAccessNoticeShown(): void {
  try {
    localStorage.setItem(STORAGE_KEY, today());
  } catch {
    // localStorage unavailable — fail open (notice may show again).
  }
}
