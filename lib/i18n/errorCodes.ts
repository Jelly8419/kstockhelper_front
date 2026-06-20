/**
 * Maps backend response `code` values to i18n keys (PRD §11, "백엔드 에러 code").
 *
 * IMPORTANT: error UI must key off `code`, never HTTP status. Notably
 * BYBIT_REFERRAL_NOT_FOUND returns HTTP 200 with success:false, so a
 * status-based mapping would mis-handle it.
 */
export const ERROR_CODE_KEY_MAP: Record<string, string> = {
  // Bybit
  BYBIT_VERIFY_OK: "error.bybitVerifyOk",
  BYBIT_UID_REQUIRED: "error.bybitUidRequired",
  BYBIT_UID_ALREADY_LINKED: "error.bybitUidAlreadyLinked",
  BYBIT_REFERRAL_NOT_FOUND: "error.bybitReferralNotFound",
  BYBIT_USER_NOT_FOUND: "error.bybitUserNotFound",
  BYBIT_VERIFY_ERROR: "error.bybitVerifyError",

  // Binance
  BINANCE_CONNECT_OK: "error.binanceConnectOk",
  BINANCE_UID_REQUIRED: "error.binanceUidRequired",
  BINANCE_UID_ALREADY_LINKED: "error.binanceUidAlreadyLinked",
  BINANCE_USER_NOT_FOUND: "error.binanceUserNotFound",
  BINANCE_CONNECT_ERROR: "error.binanceConnectError",

  // Subscription (PayPal)
  SUBSCRIPTION_CREATE_OK: "error.subscriptionCreateOk",
  SUBSCRIPTION_ALREADY_ACTIVE: "error.subscriptionAlreadyActive",
  SUBSCRIPTION_REGION_BLOCKED: "error.subscriptionRegionBlocked",
  SUBSCRIPTION_CREATE_ERROR: "error.subscriptionCreateError",
  SUBSCRIPTION_CANCEL_OK: "error.subscriptionCancelOk",
  SUBSCRIPTION_NOT_ACTIVE: "error.subscriptionNotActive",
  SUBSCRIPTION_CANCEL_ERROR: "error.subscriptionCancelError",
};

/**
 * Resolve the i18n key for a backend `code`. Returns the mapped key, or null
 * when the code is unknown/absent so callers can fall back (to the backend
 * `message`, then a generic error).
 */
export function errorKeyForCode(code?: string | null): string | null {
  if (!code) return null;
  return ERROR_CODE_KEY_MAP[code] ?? null;
}
