import type { Metadata } from "next"

import { loadEmail, EmailSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Email settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadEmail()
  return <EmailSettingsView settings={settings} />
}
