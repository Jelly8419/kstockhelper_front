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

const LOCAL_DATETIME = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "11:07" in the viewer's local timezone (chart x-axis tick). */
export function localTime(input: string | number): string {
  return LOCAL_HM.format(new Date(input));
}

/** "2026-06-16" in the viewer's local timezone (chart "Today"). */
export function localDate(input: string | number): string {
  return LOCAL_DATE.format(new Date(input));
}

/** "Jun 6, 11:07" in the viewer's local timezone (tooltip header). */
export function localDateTime(input: string | number): string {
  return LOCAL_DATETIME.format(new Date(input));
}
