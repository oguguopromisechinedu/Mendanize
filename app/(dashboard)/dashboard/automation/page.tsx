import type { Metadata } from "next"

import { AutomationView } from "@/features/admin-modules"
import { loadAutomation } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Automation",
  robots: { index: false },
}

export default async function Page() {
  const initial = await loadAutomation()
  return <AutomationView initial={initial} />
}
