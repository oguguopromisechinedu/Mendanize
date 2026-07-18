import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicTopicListView } from "@/features/categories-topics"
import { listPublicCategories, listPublicTopics } from "@/services/content"

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Focused learning topics across Mendanize — articles, guides, and tools for every subject.",
  openGraph: {
    title: "Topics | Mendanize",
    description: "Explore focused technology learning topics.",
  },
}

export default async function TopicsPage() {
  const [topics, categories] = await Promise.all([
    listPublicTopics(),
    listPublicCategories(),
  ])

  return (
    <PageShell
      title="Topics"
      hideHeader
      width="wide"
      crumbs={[{ label: "Topics" }]}
    >
      <PublicTopicListView topics={topics} categories={categories} />
    </PageShell>
  )
}
