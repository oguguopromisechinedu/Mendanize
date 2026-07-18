import type { Metadata } from "next"

import { DomainAnalyticsView, loadAiDomain } from "@/features/analytics"

export const metadata: Metadata = {
  title: "AI analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadAiDomain()
  return <DomainAnalyticsView data={data} />
}
