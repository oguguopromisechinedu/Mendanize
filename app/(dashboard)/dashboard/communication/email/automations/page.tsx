import type { Metadata } from "next"

import { EmsAutomationsView } from "@/features/email-management"
import {
  getAdminSession,
  isAdminRoleKey,
} from "@/features/authentication/server"
import {
  listEmsAutomations,
  listEmsSenders,
  listEmsTemplates,
} from "@/services/ems"

export const metadata: Metadata = {
  title: "Email automations",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const [rules, templates, senders] = await Promise.all([
    listEmsAutomations(),
    listEmsTemplates(),
    listEmsSenders(),
  ])
  return (
    <EmsAutomationsView
      rules={rules}
      templateKeys={templates
        .filter((t) => t.status === "PUBLISHED" && t.enabled)
        .map((t) => t.key)}
      senders={senders
        .filter((s) => s.status === "VERIFIED" && s.enabled)
        .map((s) => ({
          id: s.id,
          label: `${s.displayName} <${s.address}>`,
        }))}
      canEdit={isAdminRoleKey(session?.admin.roleKey)}
    />
  )
}
