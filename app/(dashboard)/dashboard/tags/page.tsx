import type { Metadata } from "next"

import { TagsListView } from "@/features/admin-modules"
import { loadTags } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Tags",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadTags({
    query: typeof raw.query === "string" ? raw.query : undefined,
  })
  return <TagsListView initial={initial} />
}
