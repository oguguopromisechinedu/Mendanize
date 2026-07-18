import type { Metadata } from "next"

import {
  TopicListView,
  loadTopicList,
} from "@/features/categories-topics"
import { listCategorySummaries } from "@/services/content"

export const metadata: Metadata = {
  title: "Topics",
  robots: { index: false },
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const categoryId =
    typeof raw.categoryId === "string" ? raw.categoryId : undefined
  const [initial, categories] = await Promise.all([
    loadTopicList({
      query: typeof raw.query === "string" ? raw.query : undefined,
      categoryId,
      pageSize: 50,
    }),
    listCategorySummaries(),
  ])
  return (
    <TopicListView
      initial={initial}
      categories={categories}
      categoryFilter={categoryId}
    />
  )
}
