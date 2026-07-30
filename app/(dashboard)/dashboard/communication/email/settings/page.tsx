import type { Metadata } from "next"

import { EmsSettingsView } from "@/features/email-management"
import {
  getAdminSession,
  isSuperAdministrator,
} from "@/features/authentication/server"
import { getEmsSettingsExtended } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email settings",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const settings = await getEmsSettingsExtended()
  return (
    <EmsSettingsView
      settings={settings}
      canEdit={Boolean(
        session && isSuperAdministrator(session.admin.roleKey),
      )}
    />
  )
}
