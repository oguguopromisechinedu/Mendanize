import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleEditorForm } from "@/features/articles"
import { loadArticleEditor } from "@/features/articles/server"

export const metadata: Metadata = {
  title: "Edit article",
  robots: { index: false },
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { article, options } = await loadArticleEditor(id)
  if (!article) notFound()
  return <ArticleEditorForm article={article} options={options} />
}
