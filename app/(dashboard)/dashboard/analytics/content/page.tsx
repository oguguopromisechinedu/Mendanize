import { loadContentDomain } from "@/features/analytics/server";
import type { Metadata } from "next"

import { DomainAnalyticsView } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Content analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadContentDomain()
  return <DomainAnalyticsView data={data} />
}
