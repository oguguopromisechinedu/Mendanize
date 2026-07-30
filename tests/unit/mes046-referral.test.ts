import { describe, expect, it } from "vitest"

import {
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  PRIMARY_REWARD_MECHANISM,
  REFERRAL_CODE_PATTERN,
} from "@/services/referrals/constants"
import { normalizeReferralCodeParam } from "@/services/referrals/cookie"

describe("MES-046 referral helpers", () => {
  it("documents manual admin payout as primary reward", () => {
    expect(PRIMARY_REWARD_MECHANISM).toBe("manual_admin_payout_flag")
    expect(DEFAULT_ATTRIBUTION_WINDOW_DAYS).toBe(30)
  })

  it("normalizes and validates referral codes", () => {
    expect(normalizeReferralCodeParam("ab12cd34")).toBe("AB12CD34")
    expect(normalizeReferralCodeParam("bad!")).toBeNull()
    expect(normalizeReferralCodeParam("xy")).toBeNull()
    expect(REFERRAL_CODE_PATTERN.test("ABCD1234")).toBe(true)
  })
})
