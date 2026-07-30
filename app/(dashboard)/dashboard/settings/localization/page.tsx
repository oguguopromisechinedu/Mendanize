import { loadLocalization } from "@/features/platform-settings/server";
import type { Metadata } from "next"

import { LocalizationSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Localization",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadLocalization()
  return <LocalizationSettingsView settings={settings} />
}
