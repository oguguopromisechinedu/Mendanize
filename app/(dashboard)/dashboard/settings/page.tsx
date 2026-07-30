import type { Metadata } from "next"

import { loadSettingsDashboard } from "@/features/platform-settings/server";
import { SettingsDashboardView } from "@/features/platform-settings";

export const metadata: Metadata = {
  title: "Platform settings",
  robots: { index: false },
}

export default async function Page() {
  const overview = await loadSettingsDashboard()
  return <SettingsDashboardView overview={overview} />
}
