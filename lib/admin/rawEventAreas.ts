/**
 * RAW event console areas — mirrors the PM data sheet (KstockHelper 데이터 적재 시트).
 * Each area = one sheet tab: a set of event_names + the area-specific properties
 * columns to surface. Common columns (created_at/event/user/country/... ) are
 * rendered for every area by the table; `propColumns` lists the extra keys read
 * from `properties` for that area, matching the sheet's extra_properties.
 */

export interface RawEventArea {
  /** Tab key. */
  id: string;
  /** Tab label (Korean, console is outside i18n). */
  label: string;
  /** event_name filter sent to the backend as `eventNames`. */
  eventNames: string[];
  /** Area-specific properties keys → column header (sheet's extra_properties). */
  propColumns: { key: string; label: string }[];
}

export const RAW_EVENT_AREAS: RawEventArea[] = [
  {
    id: "home",
    label: "Home",
    eventNames: [
      "home_viewed",
      "home_gap_banner_clicked",
      "home_start_trading_banner_clicked",
      "home_hot_in_korea_contents_clicked",
      "home_news_filter_clicked",
      "home_news_contents_clicked",
    ],
    propColumns: [
      { key: "content_id", label: "content_id" },
      { key: "content_type", label: "content_type" },
      { key: "filter_type", label: "filter_type" },
      { key: "filter_value", label: "filter_value" },
    ],
  },
  {
    id: "auth",
    label: "Auth",
    eventNames: [
      "login_required_modal_viewed",
      "login_required_modal_login_clicked",
      "signup_viewed",
      "signup_started",
      "signup_completed",
    ],
    propColumns: [
      { key: "trigger_page", label: "trigger_page" },
      { key: "trigger_action", label: "trigger_action" },
      { key: "auth_method", label: "auth_method" },
    ],
  },
  {
    id: "gap",
    label: "GapMonitor",
    eventNames: [
      "gap_monitor_viewed",
      "gap_stock_changed",
      "gap_exchange_changed",
      "gap_avg_period_changed",
      "gap_pip_clicked",
    ],
    propColumns: [
      { key: "selected_stock", label: "selected_stock" },
      { key: "selected_exchange", label: "selected_exchange" },
      { key: "avg_period", label: "avg_period" },
      { key: "session_time_seconds", label: "session_time_seconds" },
    ],
  },
  {
    id: "premium",
    label: "Premium",
    eventNames: [
      "premium_required_modal_viewed",
      "premium_required_modal_cta_clicked",
    ],
    propColumns: [
      { key: "modal_type", label: "modal_type" },
      { key: "trigger_page", label: "trigger_page" },
      { key: "trigger_feature", label: "trigger_feature" },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    eventNames: ["subscription_page_viewed", "subscribe_button_clicked"],
    propColumns: [
      { key: "plan_name", label: "plan_name" },
      { key: "currency", label: "currency" },
      { key: "payment_provider", label: "payment_provider" },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    eventNames: [
      "subscription_activated",
      "subscription_activation_failed",
      "subscription_cancelled",
      "subscription_refunded",
      "subscription_payment_failed",
    ],
    propColumns: [
      { key: "payment_provider", label: "payment_provider" },
      { key: "plan_name", label: "plan_name" },
      { key: "amount", label: "amount" },
      { key: "currency", label: "currency" },
      { key: "billing_cycle", label: "billing_cycle" },
      { key: "failure_reason", label: "failure_reason" },
      { key: "source", label: "source" },
    ],
  },
  {
    id: "mypage",
    label: "Mypage",
    eventNames: [
      "mypage_viewed",
      "subscription_cancel_completed",
      "uid_apply_clicked",
    ],
    propColumns: [{ key: "action_source", label: "action_source" }],
  },
  {
    // Real Estate (부동산) funnel. PRD asks for anonymous_id + locale + section
    // + channel; those live in `properties` (anon_id is the stored key), so they
    // go in propColumns alongside the common columns the table always shows.
    id: "real_estate",
    label: "Real Estate",
    eventNames: [
      "home_real_estate_banner_clicked",
      "real_estate_home_viewed",
      "real_estate_request_button_clicked",
      "real_estate_request_form_viewed",
      "real_estate_request_submit_clicked",
      "real_estate_contact_channel_clicked",
    ],
    propColumns: [
      { key: "anon_id", label: "anonymous_id" },
      { key: "locale", label: "locale" },
      { key: "section", label: "section" },
      { key: "channel", label: "channel" },
    ],
  },
];
