import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { UsersListView, loadUsers, loadStaffRoles } from "@/features/admin-modules"
import { requirePermission, PERMISSIONS } from "@/features/authentication/server"

export const metadata: Metadata = {
  title: "Users & Roles",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
  if (!session?.admin?.id) {
    redirect("/dashboard/login")
  }

  const raw = await searchParams
  const statusRaw = typeof raw.status === "string" ? raw.status : undefined
  const status =
    statusRaw === "ACTIVE" ||
    statusRaw === "INVITED" ||
    statusRaw === "DEACTIVATED"
      ? statusRaw
      : "ALL"

  const [initial, roles] = await Promise.all([
    loadUsers({
      query: typeof raw.query === "string" ? raw.query : undefined,
      role: typeof raw.role === "string" ? raw.role : undefined,
      status,
    }),
    loadStaffRoles(),
  ])

  const isSuperAdmin = session.admin.roleKey === "SUPER_ADMINISTRATOR"

  return (
    <UsersListView
      initial={initial}
      isSuperAdmin={isSuperAdmin}
      roles={roles}
    />
  )
}
