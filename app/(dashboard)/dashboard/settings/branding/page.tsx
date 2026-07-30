import { loadBranding } from "@/features/platform-settings/server";
import type { Metadata } from "next"

import { BrandingSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Branding",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadBranding()
  return <BrandingSettingsView settings={settings} />
}
