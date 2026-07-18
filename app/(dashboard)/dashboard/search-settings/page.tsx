import type { Metadata } from "next"

import { loadSearchSettings, SearchSettingsView } from "@/features/search"

export const metadata: Metadata = {
  title: "Search settings",
  robots: { index: false },
}

export default async function Page() {
  const overview = await loadSearchSettings()
  return <SearchSettingsView overview={overview} />
}
