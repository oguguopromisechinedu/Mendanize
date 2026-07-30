/** MES-046 referral cookie + code constraints. */

export const REFERRAL_COOKIE_NAME = "mendanize.ref"
export const REFERRAL_COOKIE_CAPTURED_AT = "mendanize.ref.at"

/** First-touch attribution; overwritten only if cookie absent. */
export const DEFAULT_ATTRIBUTION_WINDOW_DAYS = 30

export const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{4,16}$/

/** Primary reward — documented; no parallel payment rail. */
export const PRIMARY_REWARD_MECHANISM = "manual_admin_payout_flag" as const
