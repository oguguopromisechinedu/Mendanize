import type { Metadata } from "next"

import { ArticleEditorForm } from "@/features/articles"
import { loadArticleEditor } from "@/features/articles/server"

export const metadata: Metadata = {
  title: "New article",
  robots: { index: false },
}

export default async function NewArticlePage() {
  const { options } = await loadArticleEditor()
  return <ArticleEditorForm options={options} />
}
