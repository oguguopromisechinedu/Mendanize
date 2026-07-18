import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requireUser } from "@/features/authentication/server"
import {
  NotificationPreferencesView,
  loadPreferences,
} from "@/features/notifications"

export const metadata: Metadata = {
  title: "Notification preferences",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  if (!session?.user?.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/dashboard/notifications/preferences")}`,
    )
  }
  const preferences = await loadPreferences(session.user.id)
  return <NotificationPreferencesView preferences={preferences} />
}
