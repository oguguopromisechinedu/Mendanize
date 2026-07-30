import { loadSecurity } from "@/features/platform-settings/server";
import type { Metadata } from "next"

import { SecuritySettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Security settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadSecurity()
  return <SecuritySettingsView settings={settings} />
}
