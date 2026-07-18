import type { Metadata } from "next"

import { ArticleListView } from "@/features/articles"
import { loadArticleList } from "@/features/articles/server"
import type { ArticleStatusValue } from "@/services/content/types"

async function StatusArticlesPage({
  status,
  title,
  description,
  searchParams,
}: {
  status: ArticleStatusValue
  title: string
  description: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const query = typeof raw.query === "string" ? raw.query : undefined
  const page = typeof raw.page === "string" ? Number(raw.page) : 1

  const initial = await loadArticleList({
    status,
    query,
    page: Number.isFinite(page) ? page : 1,
    pageSize: 20,
  })

  return (
    <ArticleListView
      initial={initial}
      statusFilter={status}
      title={title}
      description={description}
    />
  )
}

export function makeStatusPage(
  status: ArticleStatusValue,
  title: string,
  description: string
) {
  return async function Page({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
  }) {
    return StatusArticlesPage({
      status,
      title,
      description,
      searchParams,
    })
  }
}

export function statusMetadata(title: string): Metadata {
  return { title, robots: { index: false } }
}
