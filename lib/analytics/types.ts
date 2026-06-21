/**
 * Analytics event names (MVP conversion funnel). snake_case per the logging
 * spec. Keep this union in sync with the events instrumented across the app and
 * the funnel definition in supabase/migrations/0007_events.sql.
 */
export type EventName =
  // Home
  | "home_viewed"
  | "home_gap_banner_clicked"
  | "home_start_trading_banner_clicked"
  | "home_hot_in_korea_contents_clicked"
  | "home_news_filter_clicked"
  | "home_news_contents_clicked"
  // Auth
  | "login_required_modal_viewed"
  | "login_required_modal_login_clicked"
  | "signup_started"
  | "signup_completed"
  // Gap Monitor
  | "gap_monitor_viewed"
  | "gap_stock_changed"
  | "gap_exchange_changed"
  | "gap_avg_period_changed"
  | "gap_pip_clicked"
  // Premium
  | "premium_required_modal_viewed"
  | "premium_required_modal_cta_clicked"
  // Subscription / payment
  | "subscription_page_viewed"
  | "subscribe_button_clicked"
  | "subscription_activated"
  | "subscription_activation_failed"
  | "subscription_cancelled"
  // My page (settings)
  | "mypage_viewed"
  | "uid_apply_clicked";

/** Arbitrary per-event properties merged into the `properties` jsonb column. */
export type EventProps = Record<string, unknown>;

/** 'guest' | 'basic' | 'premium' — the analytics membership_status values. */
export type MembershipStatus = "guest" | "basic" | "premium";

/** Device class recorded with every event. */
export type DeviceType = "desktop" | "mobile" | "tablet";

/**
 * Shape inserted into public.events. The hot analytics columns are top-level;
 * everything else (incl. locale) lives in `properties`.
 */
export interface EventRow {
  event_name: EventName;
  user_id: string | null;
  country_code: string | null;
  country_group: "restricted" | "allowed";
  membership_status: MembershipStatus;
  device_type: DeviceType;
  page_path: string;
  properties: EventProps;
}
