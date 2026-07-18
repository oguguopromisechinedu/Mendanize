import type { Metadata } from "next"

import { DomainAnalyticsView, loadLearningDomain } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Learning analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadLearningDomain()
  return <DomainAnalyticsView data={data} />
}
