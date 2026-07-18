import type { Metadata } from "next"

import { DomainAnalyticsView, loadTrafficDomain } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Traffic analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadTrafficDomain()
  return <DomainAnalyticsView data={data} />
}
