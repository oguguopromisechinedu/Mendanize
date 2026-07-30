import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { LearnerReferralView } from "@/features/referrals"
import { getLearnerReferralDashboard } from "@/services/referrals"

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/referrals")}`)
  }

  const dashboard = await getLearnerReferralDashboard(session.user.id)
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"

  return <LearnerReferralView dashboard={dashboard} appOrigin={origin} />
}
