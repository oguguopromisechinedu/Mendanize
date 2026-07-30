import type { Metadata } from "next"

import { IntegrationsView } from "@/features/admin-modules"
import { loadIntegrations } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "AI & Integrations",
  robots: { index: false },
}

export default async function Page() {
  const items = await loadIntegrations()
  return <IntegrationsView items={items} />
}
