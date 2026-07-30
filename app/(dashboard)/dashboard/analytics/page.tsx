import type { Metadata } from "next"

import { loadOverview } from "@/features/analytics/server";
import { AnalyticsOverviewView } from "@/features/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadOverview()
  return <AnalyticsOverviewView data={data} />
}
