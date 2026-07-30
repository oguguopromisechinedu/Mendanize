import { loadLearningDomain } from "@/features/analytics/server";
import type { Metadata } from "next"

import { DomainAnalyticsView } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Learning analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadLearningDomain()
  return <DomainAnalyticsView data={data} />
}
