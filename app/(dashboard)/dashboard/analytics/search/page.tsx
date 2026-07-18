import type { Metadata } from "next"

import { DomainAnalyticsView, loadSearchDomain } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Search analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadSearchDomain()
  return <DomainAnalyticsView data={data} />
}
