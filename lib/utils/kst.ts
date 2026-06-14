/**
 * KST (Asia/Seoul) time formatting for Price Gap Monitor, which always shows
 * times in KST regardless of the viewer's timezone (PRD §16: "All times in KST").
 */

const KST_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const KST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "09:41:23" in KST from an ISO string or epoch ms. */
export function kstTime(input: string | number): string {
  return KST_TIME.format(new Date(input));
}

/** "2026-06-14 09:41:23 KST". */
export function kstDateTime(input: string | number): string {
  const d = new Date(input);
  return `${KST_DATE.format(d)} ${KST_TIME.format(d)} KST`;
}
