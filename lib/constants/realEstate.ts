/**
 * Real Estate buying-support contact channels (k-property revisions §2).
 *
 * The messaging channels (WhatsApp / WeChat / LINE) are shown as QR codes; WeChat
 * and LINE also show a friend-add ID under the QR. Telegram was removed (no
 * translation, account needs a phone number we don't have). Email stays a mailto.
 *
 * QR image files live in /public as qr-{channel}.jpg (PM-provided assets). The
 * fixed support email and the WeChat/LINE IDs come from the PRD.
 */

/** Support email shown under the Email channel (PRD-fixed). */
export const REAL_ESTATE_SUPPORT_EMAIL = "kstockhelper@gmail.com";

export type RealEstateChannelKey = "whatsapp" | "wechat" | "line" | "email";

export interface RealEstateChannel {
  /** Channel key — maps to `realEstate.channels.<key>` i18n label. */
  key: RealEstateChannelKey;
  /** QR image path under /public, or null for the email channel. */
  qr: string | null;
  /** Friend-add ID shown under the QR (WeChat/LINE), or null. */
  id: string | null;
  /** mailto/link target for the email channel, or null for QR channels. */
  href: string | null;
}

/**
 * Channel list (PRD order: WhatsApp, WeChat, LINE, Email). QR image filenames are
 * assumed; swap to the actual PM-provided filenames if they differ.
 */
export const REAL_ESTATE_CONTACT_CHANNELS: RealEstateChannel[] = [
  {
    key: "whatsapp",
    qr: "/qr-whatsapp.jpg",
    id: null,
    href: null,
  },
  {
    key: "wechat",
    qr: "/qr-wechat.jpg",
    id: "koreaproperty",
    href: null,
  },
  {
    key: "line",
    qr: "/qr-line.jpg",
    id: "Koreaproperty",
    href: null,
  },
  {
    key: "email",
    qr: null,
    id: null,
    href: `mailto:${REAL_ESTATE_SUPPORT_EMAIL}`,
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
