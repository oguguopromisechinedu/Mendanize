import type { Metadata } from "next"

import { CreateHubView } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Create",
  robots: { index: false },
}

export default function Page() {
  return <CreateHubView />
}
