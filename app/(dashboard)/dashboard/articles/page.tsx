import type { Metadata } from "next"

import { ArticleListView } from "@/features/articles"
import { loadArticleList } from "@/features/articles/server"
import { articleListQuerySchema } from "@/features/articles"
import type { ArticleStatusValue } from "@/services/content/types"

export const metadata: Metadata = {
  title: "Articles",
  robots: { index: false },
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const parsed = articleListQuerySchema.safeParse({
    page: raw.page,
    pageSize: raw.pageSize,
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: typeof raw.status === "string" ? raw.status : "ALL",
    categoryId: typeof raw.categoryId === "string" ? raw.categoryId : undefined,
    topicId: typeof raw.topicId === "string" ? raw.topicId : undefined,
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    sortDir: typeof raw.sortDir === "string" ? raw.sortDir : undefined,
  })

  const params = parsed.success
    ? parsed.data
    : { status: "ALL" as const, page: 1, pageSize: 20 }

  const initial = await loadArticleList({
    page: params.page,
    pageSize: params.pageSize ?? 20,
    query: params.query,
    status: (params.status as ArticleStatusValue | "ALL") ?? "ALL",
    categoryId: params.categoryId,
    topicId: params.topicId,
    sort: params.sort,
    sortDir: params.sortDir,
  })

  return (
    <ArticleListView
      initial={initial}
      statusFilter={(params.status as ArticleStatusValue | "ALL") ?? "ALL"}
    />
  )
}
