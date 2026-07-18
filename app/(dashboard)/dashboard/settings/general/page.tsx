import type { Metadata } from "next"

import { loadGeneral, GeneralSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "General",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadGeneral()
  return <GeneralSettingsView settings={settings} />
}
