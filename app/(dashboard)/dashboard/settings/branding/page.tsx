import type { Metadata } from "next"

import { loadBranding, BrandingSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Branding",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadBranding()
  return <BrandingSettingsView settings={settings} />
}
