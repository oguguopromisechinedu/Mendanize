import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requireUser } from "@/features/authentication/server"
import {
  NotificationCenterView,
  loadCenter,
} from "@/features/notifications"

export const metadata: Metadata = {
  title: "Notification center",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  if (!session?.user?.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/dashboard/notifications/center")}`,
    )
  }
  const initial = await loadCenter(session.user.id)
  return <NotificationCenterView initial={initial} />
}
