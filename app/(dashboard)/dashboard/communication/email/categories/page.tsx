import type { Metadata } from "next"

import { EmsCategoriesView } from "@/features/email-management"
import {
  getAdminSession,
  isAdminRoleKey,
} from "@/features/authentication/server"
import { listEmsCategories } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email categories",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const categories = await listEmsCategories()
  return (
    <EmsCategoriesView
      categories={categories}
      canDelete={isAdminRoleKey(session?.admin.roleKey)}
    />
  )
}
