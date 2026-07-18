import type { Metadata } from "next"

import { AutomationView, loadAutomation } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Automation",
  robots: { index: false },
}

export default async function Page() {
  const initial = await loadAutomation()
  return <AutomationView initial={initial} />
}
