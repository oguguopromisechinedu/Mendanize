import type { Metadata } from "next"

import { loadSecurity, SecuritySettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Security settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadSecurity()
  return <SecuritySettingsView settings={settings} />
}
