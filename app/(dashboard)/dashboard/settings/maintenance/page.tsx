import { loadMaintenance } from "@/features/platform-settings/server";
import type { Metadata } from "next"

import { MaintenanceSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadMaintenance()
  return <MaintenanceSettingsView settings={settings} />
}
