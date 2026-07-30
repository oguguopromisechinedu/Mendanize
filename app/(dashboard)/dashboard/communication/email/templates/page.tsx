import type { Metadata } from "next"

import { EmsTemplatesView } from "@/features/email-management"
import {
  getAdminSession,
  isSuperAdministrator,
} from "@/features/authentication/server"
import { listEmsTemplates } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email templates",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const templates = await listEmsTemplates()
  return (
    <EmsTemplatesView
      templates={templates}
      canDelete={Boolean(
        session && isSuperAdministrator(session.admin.roleKey),
      )}
    />
  )
}
