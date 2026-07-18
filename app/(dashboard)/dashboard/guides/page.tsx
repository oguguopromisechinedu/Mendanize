import type { Metadata } from "next"

import { GuideListView, loadGuideList } from "@/features/learning-guides"
import type { GuideStatusValue } from "@/services/content/types"

export const metadata: Metadata = {
  title: "Learning Guides",
  robots: { index: false },
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const status =
    typeof raw.status === "string"
      ? (raw.status as GuideStatusValue | "ALL")
      : "ALL"
  const initial = await loadGuideList({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status,
    pageSize: 50,
  })
  return <GuideListView initial={initial} statusFilter={status} />
}
