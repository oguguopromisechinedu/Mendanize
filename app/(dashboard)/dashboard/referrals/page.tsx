import type { Metadata } from "next"

import { ReferralsAdminView } from "@/features/referrals"
import { getAdminReferralOverview } from "@/services/referrals"

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false },
}

export default async function Page() {
  const overview = await getAdminReferralOverview()
  return <ReferralsAdminView overview={overview} />
}
