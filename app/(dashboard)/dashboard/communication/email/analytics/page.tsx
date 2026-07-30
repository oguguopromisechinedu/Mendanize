import type { Metadata } from "next"

import { EmsAnalyticsView } from "@/features/email-management"
import { getEmsAnalytics } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email analytics",
  robots: { index: false },
}

export default async function Page() {
  const analytics = await getEmsAnalytics()
  return <EmsAnalyticsView analytics={analytics} />
}
