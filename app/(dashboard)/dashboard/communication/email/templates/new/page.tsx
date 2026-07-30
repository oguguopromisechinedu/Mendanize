import type { Metadata } from "next"

import { EmsTemplateEditor } from "@/features/email-management"
import {
  getAdminSession,
  isAdminRoleKey,
} from "@/features/authentication/server"
import { listEmsCategories, listEmsSenders } from "@/services/ems"

export const metadata: Metadata = {
  title: "New email template",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const [categories, senders] = await Promise.all([
    listEmsCategories(),
    listEmsSenders(),
  ])
  const role = session?.admin.roleKey ?? ""

  return (
    <EmsTemplateEditor
      template={null}
      categories={categories.map((c) => ({ id: c.id, label: c.name }))}
      senders={senders
        .filter((s) => s.status === "VERIFIED" && s.enabled)
        .map((s) => ({
          id: s.id,
          label: `${s.displayName} <${s.address}>`,
        }))}
      canPublish={isAdminRoleKey(role)}
      canTest={false}
    />
  )
}
