import type { Metadata } from "next"

import { EmsQueueView } from "@/features/email-management"
import {
  getAdminSession,
  isAdminRoleKey,
} from "@/features/authentication/server"
import { listEmsQueue } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email queue",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const items = await listEmsQueue()
  return (
    <EmsQueueView
      items={items}
      canOps={isAdminRoleKey(session?.admin.roleKey)}
    />
  )
}
