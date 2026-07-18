import type { Metadata } from "next"

import { loadAuthSettings, AuthSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Authentication",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadAuthSettings()
  return <AuthSettingsView settings={settings} />
}
