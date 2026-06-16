/**
 * Local-time formatting for the Gap Tracker chart. Market data is based on KST,
 * but the chart x-axis, tooltip, and "Today" are shown in the viewer's local
 * timezone (PRD §7.11–§7.12). These use the runtime default timezone.
 */

const LOCAL_HM = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const LOCAL_DATE = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Tooltip header parts. We build "MM/DD HH:mm" by hand (Price Gap revisions §9):
 * Intl has no portable numeric "MM/DD" without a year, so format date and time
 * separately and join them.
 */
const LOCAL_MD = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
});

/** "11:07" in the viewer's local timezone (chart x-axis tick). */
export function localTime(input: string | number): string {
  return LOCAL_HM.format(new Date(input));
}

/** "2026-06-16" in the viewer's local timezone (chart "Today"). */
export function localDate(input: string | number): string {
  return LOCAL_DATE.format(new Date(input));
}

/** "06/16 11:07" (MM/DD HH:mm) in the viewer's local timezone (tooltip header). */
export function localDateTime(input: string | number): string {
  const d = new Date(input);
  return `${LOCAL_MD.format(d)} ${LOCAL_HM.format(d)}`;
}

/** "2026-06-16 17:03" in the viewer's local timezone ("Last updated"). */
export function localDateTimeFull(input: string | number): string {
  const d = new Date(input);
  return `${LOCAL_DATE.format(d)} ${LOCAL_HM.format(d)}`;
}
