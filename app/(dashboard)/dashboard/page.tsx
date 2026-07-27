import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requireEditor } from "@/features/authentication/server"
import { DashboardHomeView } from "@/features/admin-dashboard"
import { loadDashboardHome } from "@/features/admin-dashboard/server"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
}

export default async function DashboardOverviewPage() {
  const session = await requireEditor()
  if (!session?.admin?.id) {
    redirect("/dashboard/login")
  }
  const data = await loadDashboardHome(session.admin.id)
  return <DashboardHomeView data={data} />
}
