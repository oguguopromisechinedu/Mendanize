import type { Metadata } from "next"

import { IntegrationsView, loadIntegrations } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "AI & Integrations",
  robots: { index: false },
}

export default async function Page() {
  const items = await loadIntegrations()
  return <IntegrationsView items={items} />
}
