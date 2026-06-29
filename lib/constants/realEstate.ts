/**
 * Real Estate buying-support contact channels.
 *
 * Per PRD ("부동산 구매 요청 홈 PRD" §8-7, "구매 지원 요청 입력 페이지 PRD" §9),
 * channel URLs/IDs are configuration values, not hardcoded business data — they
 * are sourced from env so they can change per environment without a code change.
 * Only the support email is fixed in the PRD (kstockhelper@gmail.com).
 *
 * A channel with an empty href is still rendered but disabled (no link target
 * configured yet), so the UI never points at a dead "#" link.
 */

/** Support email shown under the Email channel (PRD-fixed). */
export const REAL_ESTATE_SUPPORT_EMAIL = "kstockhelper@gmail.com";

export type RealEstateChannelKey =
  | "whatsapp"
  | "wechat"
  | "line"
  | "telegram"
  | "email";

export interface RealEstateChannel {
  /** Channel key — maps to `realEstate.channels.<key>` i18n label. */
  key: RealEstateChannelKey;
  /** Link target. Empty string = not configured (rendered disabled). */
  href: string;
  /** Whether to open in a new tab (external messaging apps; not the mailto). */
  external: boolean;
}

/**
 * Ordered channel list (display order matches PRD: WhatsApp, WeChat, LINE,
 * Telegram, Email). URLs come from env; Email is a mailto built from the fixed
 * support address. WeChat is typically an ID/QR rather than a URL — when its env
 * is blank the button renders disabled, leaving room to swap in a QR modal later.
 */
export const REAL_ESTATE_CHANNELS: RealEstateChannel[] = [
  {
    key: "whatsapp",
    href: process.env.NEXT_PUBLIC_RE_WHATSAPP_URL ?? "",
    external: true,
  },
  {
    key: "wechat",
    href: process.env.NEXT_PUBLIC_RE_WECHAT_URL ?? "",
    external: true,
  },
  {
    key: "line",
    href: process.env.NEXT_PUBLIC_RE_LINE_URL ?? "",
    external: true,
  },
  {
    key: "telegram",
    href: process.env.NEXT_PUBLIC_RE_TELEGRAM_URL ?? "",
    external: true,
  },
  {
    key: "email",
    href: `mailto:${REAL_ESTATE_SUPPORT_EMAIL}`,
    external: false,
  },
];

/** Un-prefixed route path of the Real Estate home (slug fixed in English). */
export const REAL_ESTATE_HOME_PATH = "/buy-korean-real-estate";

/** Un-prefixed route path of the buying-support request page. */
export const REAL_ESTATE_REQUEST_PATH = "/buy-korean-real-estate/request";

/** Currency options for the budget field (PRD §7-4, 9 fixed options). */
export const REAL_ESTATE_CURRENCIES = [
  { code: "USD", label: "USD — United States Dollar" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "TWD", label: "TWD — Taiwan Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "VND", label: "VND — Vietnamese Dong" },
  { code: "NZD", label: "NZD — New Zealand Dollar" },
  { code: "KRW", label: "KRW — Korean Won" },
] as const;

export type RealEstateCurrency =
  (typeof REAL_ESTATE_CURRENCIES)[number]["code"];

/** Property type options (PRD §7-5, 4 fixed options). */
export const REAL_ESTATE_PROPERTY_TYPES = [
  "apartment",
  "officetel",
  "other",
  "not_sure",
] as const;

export type RealEstatePropertyType =
  (typeof REAL_ESTATE_PROPERTY_TYPES)[number];
