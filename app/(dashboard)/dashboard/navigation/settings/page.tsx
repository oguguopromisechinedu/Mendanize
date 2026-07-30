import { loadNavigationSettings } from "@/features/navigation/server";
import type { Metadata } from "next"

import { NavigationSettingsView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Navigation settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadNavigationSettings()
  return <NavigationSettingsView settings={settings} />
}
