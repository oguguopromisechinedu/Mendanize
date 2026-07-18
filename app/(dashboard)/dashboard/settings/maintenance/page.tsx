import type { Metadata } from "next"

import { loadMaintenance, MaintenanceSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadMaintenance()
  return <MaintenanceSettingsView settings={settings} />
}
