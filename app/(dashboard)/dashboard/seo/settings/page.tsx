import type { Metadata } from "next"

import { SeoSettingsView } from "@/features/seo"
import { loadSeoSettings } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Global SEO settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadSeoSettings()
  return <SeoSettingsView settings={settings} />
}
