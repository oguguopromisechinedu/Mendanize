import type { Metadata } from "next"

import { loadSearchPlatform, SearchPlatformSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Search settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadSearchPlatform()
  return <SearchPlatformSettingsView settings={settings} />
}
