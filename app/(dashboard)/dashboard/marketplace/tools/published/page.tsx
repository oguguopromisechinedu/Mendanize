import { loadToolList } from "@/features/ai-tools/server";
import type { Metadata } from "next"

import { ToolListView } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Marketplace AI Tools — Published",
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
    status: "PUBLISHED",
    pageSize: 50,
  })
  return (
    <ToolListView
      initial={initial}
      statusFilter="PUBLISHED"
      basePath={BASE}
      title="Published marketplace tools"
      description="Live on the public AI Tools Marketplace."
    />
  )
}
