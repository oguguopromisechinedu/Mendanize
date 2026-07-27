import type { Metadata } from "next"

import { ToolListView, loadToolList } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Marketplace AI Tools — Drafts",
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
    status: "DRAFT",
    pageSize: 50,
  })
  return (
    <ToolListView
      initial={initial}
      statusFilter="DRAFT"
      basePath={BASE}
      title="Draft marketplace tools"
      description="Unpublished catalog tools."
    />
  )
}
