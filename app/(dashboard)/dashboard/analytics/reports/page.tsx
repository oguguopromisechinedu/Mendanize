import type { Metadata } from "next"

import { ReportsView, loadReports } from "@/features/analytics"

export const metadata: Metadata = {
  title: "Analytics reports",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadReports()
  return <ReportsView reports={data.reports} config={data.config} />
}
