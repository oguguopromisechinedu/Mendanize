import type { Metadata } from "next"

import { CodeExecutionAdminView } from "@/features/code-execution"
import {
  getAdminSession,
  isSuperAdministrator,
} from "@/features/authentication/server"
import { getCodeExecutionUsageAdmin } from "@/services/code-execution"

export const metadata: Metadata = {
  title: "Code execution",
  robots: { index: false },
}

export default async function Page() {
  const session = await getAdminSession()
  const usage = await getCodeExecutionUsageAdmin()
  return (
    <CodeExecutionAdminView
      settings={usage.settings}
      todayCount={usage.todayCount}
      runs={usage.runs}
      canManage={Boolean(
        session && isSuperAdministrator(session.admin.roleKey),
      )}
    />
  )
}
