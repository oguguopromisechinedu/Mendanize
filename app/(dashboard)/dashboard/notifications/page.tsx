import type { Metadata } from "next"

import { requireUser } from "@/features/authentication/server"
import {
  NotificationsDashboardView,
  loadDashboard,
} from "@/features/notifications"

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  const data = await loadDashboard(session?.user?.id)
  return <NotificationsDashboardView data={data} />
}
