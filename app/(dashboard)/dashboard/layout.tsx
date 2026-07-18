import { redirect } from "next/navigation"

import { requireEditor } from "@/features/authentication/server"
import { DashboardShell } from "@/features/admin-dashboard"
import { getAdminNavigationConfig } from "@/services/settings/admin-navigation"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireEditor()
  if (!session) {
    redirect("/sign-in")
  }

  const nav = await getAdminNavigationConfig()

  return (
    <DashboardShell session={session} nav={nav}>
      {children}
    </DashboardShell>
  )
}
