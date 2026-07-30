import type { Metadata } from "next"

import { EmsSendersView } from "@/features/email-management"
import {
  getAdminSession,
  isSuperAdministrator,
} from "@/features/authentication/server"
import { listEmsSenders } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email senders",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const senders = await listEmsSenders()
  return (
    <EmsSendersView
      senders={senders}
      canManage={Boolean(
        session && isSuperAdministrator(session.admin.roleKey),
      )}
    />
  )
}
