import type { Metadata } from "next"

import { BackupSettingsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Backup",
  robots: { index: false },
}

export default function Page() {
  return <BackupSettingsView />
}
