import type { Metadata } from "next"

import { DashboardHomeView } from "@/features/admin-dashboard"
import { loadDashboardHome } from "@/features/admin-dashboard/server"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
}

export default async function DashboardOverviewPage() {
  const data = await loadDashboardHome()
  return <DashboardHomeView data={data} />
}
