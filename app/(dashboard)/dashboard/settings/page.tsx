import type { Metadata } from "next"

import {
  loadSettingsDashboard,
  SettingsDashboardView,
} from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Platform settings",
  robots: { index: false },
}

export default async function Page() {
  const overview = await loadSettingsDashboard()
  return <SettingsDashboardView overview={overview} />
}
