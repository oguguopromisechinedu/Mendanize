import { loadUserDomain } from "@/features/analytics/server";
import type { Metadata } from "next"

import { DomainAnalyticsView } from "@/features/analytics"

export const metadata: Metadata = {
  title: "User analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadUserDomain()
  return <DomainAnalyticsView data={data} />
}
