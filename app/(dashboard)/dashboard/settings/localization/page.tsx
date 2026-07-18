import type { Metadata } from "next"

import { loadLocalization, LocalizationSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Localization",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadLocalization()
  return <LocalizationSettingsView settings={settings} />
}
