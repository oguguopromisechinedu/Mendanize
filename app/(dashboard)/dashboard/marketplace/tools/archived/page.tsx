import { loadToolList } from "@/features/ai-tools/server";
import type { Metadata } from "next"

import { ToolListView } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Marketplace AI Tools — Archived",
  robots: { index: false },
}

const BASE = "/dashboard/marketplace/tools"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadToolList({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: "ARCHIVED",
    pageSize: 50,
  })
  return (
    <ToolListView
      initial={initial}
      statusFilter="ARCHIVED"
      basePath={BASE}
      title="Archived marketplace tools"
      description="Hidden from the public marketplace."
    />
  )
}
