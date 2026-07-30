import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { LearnerDisputesView } from "@/features/disputes"
import {
  listDisputesForUser,
  listEligibleContractsForDispute,
} from "@/services/disputes"

export const metadata: Metadata = {
  title: "Work disputes",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/account/work/disputes")}`,
    )
  }

  const [disputes, contracts] = await Promise.all([
    listDisputesForUser(session.user.id),
    listEligibleContractsForDispute(session.user.id, "worker"),
  ])

  return (
    <LearnerDisputesView
      role="worker"
      disputes={disputes}
      contracts={contracts}
    />
  )
}
