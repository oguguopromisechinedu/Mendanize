import type { Metadata } from "next"

import { ContentHubView } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false },
}

export default function Page() {
  return <ContentHubView />
}
