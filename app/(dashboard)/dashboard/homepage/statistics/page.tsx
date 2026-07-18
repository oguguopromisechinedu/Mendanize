import type { Metadata } from "next"

import {
  HomepageStatisticsView,
  loadHomepageAdmin,
} from "@/features/homepage-management"

export const metadata: Metadata = {
  title: "Homepage statistics",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageStatisticsView record={record} />
}
