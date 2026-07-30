export type ReferralSettingRecord = {
  enabled: boolean
  attributionWindowDays: number
  rewardMechanism: string
}

export type ReferralCodeRecord = {
  id: string
  publicUserId: string
  code: string
  enabled: boolean
  disabledReason: string | null
  sharePath: string
  createdAt: string
}

export type LearnerReferralDashboard = {
  code: ReferralCodeRecord
  settings: ReferralSettingRecord
  attributionCount: number
  conversionCount: number
  pendingRewards: number
  grantedRewards: number
  recentAttributions: Array<{
    id: string
    attributedAt: string
    converted: boolean
    abuseFlagged: boolean
  }>
  recentConversions: Array<{
    id: string
    planTier: string
    convertedAt: string
    rewardStatus: string | null
  }>
}

export type AdminReferralOverview = {
  settings: ReferralSettingRecord
  codes: Array<{
    id: string
    code: string
    enabled: boolean
    publicUserId: string
    ownerEmail: string | null
    attributionCount: number
    conversionCount: number
    createdAt: string
  }>
  attributions: Array<{
    id: string
    code: string
    referredEmail: string | null
    attributedAt: string
    abuseFlagged: boolean
    abuseReason: string | null
    selfReferralBlocked: boolean
    converted: boolean
  }>
  conversions: Array<{
    id: string
    planTier: string
    convertedAt: string
    status: string
    referrerEmail: string | null
    referredEmail: string | null
    rewardId: string | null
    rewardStatus: string | null
  }>
  rewards: Array<{
    id: string
    status: string
    note: string | null
    createdAt: string
    conversionId: string
    referrerEmail: string | null
    planTier: string
  }>
}
