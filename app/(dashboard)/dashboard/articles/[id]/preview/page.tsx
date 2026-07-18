import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticlePreviewView } from "@/features/articles"
import { loadRecommendations } from "@/features/recommendations/server"
import { getArticleById } from "@/services/content"

export const metadata: Metadata = {
  title: "Preview article",
  robots: { index: false },
}

export default async function PreviewArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticleById(id)
  if (!article) notFound()
  const { items } = await loadRecommendations({
    contextType: "article",
    contextId: article.id,
    limit: 6,
  })
  return <ArticlePreviewView article={article} related={items} />
}
