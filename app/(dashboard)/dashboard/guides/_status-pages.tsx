import { loadGuideList } from "@/features/learning-guides/server";
import type { Metadata } from "next"

import { GuideListView } from "@/features/learning-guides"
import type { GuideStatusValue } from "@/services/content/types"

function makeStatusPage(
  status: GuideStatusValue,
  title: string,
  description: string
) {
  return async function Page({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
  }) {
    const raw = await searchParams
    const initial = await loadGuideList({
      status,
      query: typeof raw.query === "string" ? raw.query : undefined,
      pageSize: 50,
    })
    return (
      <GuideListView
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
  "Draft guides",
  "Guides still being structured."
)

export const PublishedPage = makeStatusPage(
  "PUBLISHED",
  "Published guides",
  "Live learning paths (public pages land in MES-025)."
)

export const ArchivedPage = makeStatusPage(
  "ARCHIVED",
  "Archived guides",
  "Retired guides retained for history."
)
