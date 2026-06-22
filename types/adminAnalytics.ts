/**
 * Admin console analytics types — mirror the backend analytics endpoints
 * (백엔드회신_콘솔_이벤트통계API.md). `day` is an ISO UTC timestamp; the console
 * renders it as a KST date label.
 */

/** Row of GET /internal/admin/analytics/dau. */
export interface AnalyticsDauRow {
  day: string;
  /** Unique visitors incl. guests (distinct properties.anon_id). May be absent
   *  until the backend exposes it — treated as 0 when missing. */
  uniqueVisitors?: number;
  loggedInUsers: number;
  totalEvents: number;
}

/** Funnel stage counts (one day, or the period total). */
export interface AnalyticsFunnel {
  visited: number;
  signedUp: number;
  gapViewed: number;
  premiumBlocked: number;
  subPageViewed: number;
  subscribeClicked: number;
  activated: number;
}

/** Row of GET /internal/admin/analytics/funnel (mode=daily). */
export interface AnalyticsFunnelRow extends AnalyticsFunnel {
  day: string;
}

/** Row of GET /internal/admin/analytics/events. */
export interface AnalyticsEventRow {
  day: string;
  eventName: string;
  count: number;
}

export interface AnalyticsDauResponse {
  rows: AnalyticsDauRow[];
}
export interface AnalyticsFunnelResponse {
  rows: AnalyticsFunnelRow[];
}
export interface AnalyticsEventsResponse {
  rows: AnalyticsEventRow[];
}
