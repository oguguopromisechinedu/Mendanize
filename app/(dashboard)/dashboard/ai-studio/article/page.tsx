import type { Metadata } from "next"

import {
  GenerateArticleView,
  loadStudioTaxonomy,
} from "@/features/ai-studio"

export const metadata: Metadata = {
  title: "Generate article",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GenerateArticlePage({ searchParams }: PageProps) {
  const raw = await searchParams
  const topic = typeof raw.topic === "string" ? raw.topic : null
  const { categories, topics } = await loadStudioTaxonomy()
  return (
    <GenerateArticleView
      categories={categories}
      topics={topics}
      initialTopic={topic}
    />
  )
}
