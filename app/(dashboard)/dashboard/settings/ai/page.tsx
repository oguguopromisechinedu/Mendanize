import type { Metadata } from "next"

import { loadAiSettings, AiSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "AI settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadAiSettings()
  return <AiSettingsView settings={settings} />
}
