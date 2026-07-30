import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { CodingWorkspaceLab } from "@/features/code-execution"
import {
  getCodeExecutionSettings,
  getOrCreateDefaultWorkspace,
  listRecentRunsForUser,
} from "@/services/code-execution"
import { getSubscriptionForUser } from "@/services/billing/service"
import { listPublishedWorkspacePresets } from "@/services/ecosystem"

export const metadata: Metadata = {
  title: "Coding workspace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/workspace")}`)
  }

  const userId = session.user.id
  const [workspace, presets, recentRuns, settings, sub] = await Promise.all([
    getOrCreateDefaultWorkspace(userId),
    listPublishedWorkspacePresets(),
    listRecentRunsForUser(userId, 5),
    getCodeExecutionSettings(),
    getSubscriptionForUser(userId),
  ])

  const paid = sub.plan !== "FREE" && sub.status === "active"
  const limit = paid ? settings.paidDailyLimit : settings.freeDailyLimit

  return (
    <CodingWorkspaceLab
      workspace={workspace}
      presets={presets}
      recentRuns={recentRuns}
      executionEnabled={settings.enabled}
      dailyLimitNote={`Daily run limit: ${limit} (${paid ? "paid" : "free"} tier).`}
    />
  )
}
