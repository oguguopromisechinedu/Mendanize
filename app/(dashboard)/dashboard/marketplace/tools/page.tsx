import { loadToolList } from "@/features/ai-tools/server";
import type { Metadata } from "next"

import { ToolListView } from "@/features/ai-tools"
import type { ToolStatusValue } from "@/services/content/types"

export const metadata: Metadata = {
  title: "Marketplace AI Tools",
  robots: { index: false },
}

const BASE = "/dashboard/marketplace/tools"

export default async function MarketplaceToolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const status =
    typeof raw.status === "string"
      ? (raw.status as ToolStatusValue | "ALL")
      : "ALL"
  const initial = await loadToolList({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status,
    pageSize: 50,
  })
  return (
    <ToolListView
      initial={initial}
      statusFilter={status}
      basePath={BASE}
      title="Marketplace AI Tools"
      description="Curate catalog tools for the public AI Tools Marketplace. Creator submissions still require Admin approval before they appear."
    />
  )
}
