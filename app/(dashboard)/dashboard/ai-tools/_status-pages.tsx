import type { Metadata } from "next"

import { ToolListView, loadToolList } from "@/features/ai-tools"
import type { ToolStatusValue } from "@/services/content/types"

function makeStatusPage(
  status: ToolStatusValue,
  title: string,
  description: string
) {
  return async function Page({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
  }) {
    const raw = await searchParams
    const initial = await loadToolList({
      status,
      query: typeof raw.query === "string" ? raw.query : undefined,
      pageSize: 50,
    })
    return (
      <ToolListView
        initial={initial}
        statusFilter={status}
        title={title}
        description={description}
      />
    )
  }
}

export function statusMetadata(title: string): Metadata {
  return { title, robots: { index: false } }
}

export const DraftsPage = makeStatusPage(
  "DRAFT",
  "Draft tools",
  "Tools still being curated for Discover."
)

export const PublishedPage = makeStatusPage(
  "PUBLISHED",
  "Published tools",
  "Live directory entries (public pages land in MES-027)."
)

export const ArchivedPage = makeStatusPage(
  "ARCHIVED",
  "Archived tools",
  "Retired listings retained for history."
)
