import { loadToolList } from "@/features/ai-tools/server";
import type { Metadata } from "next"

import { ToolListView } from "@/features/ai-tools"
import type { ToolStatusValue } from "@/services/content/types"

export const metadata: Metadata = {
  title: "AI Tools",
  robots: { index: false },
}

export default async function AiToolsPage({
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
  return <ToolListView initial={initial} statusFilter={status} />
}
