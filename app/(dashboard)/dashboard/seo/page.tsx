import type { Metadata } from "next"

import { SeoDashboardView } from "@/features/seo"
import { loadSeoDashboard } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "SEO Center",
  robots: { index: false },
}

export default async function Page() {
  const stats = await loadSeoDashboard()
  return <SeoDashboardView stats={stats} />
}
