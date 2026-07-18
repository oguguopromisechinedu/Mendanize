import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { ToolDirectoryView } from "@/features/ai-tools"
import {
  listCategories,
  listPublishedTools,
  listTopics,
} from "@/services/content"

export const metadata: Metadata = {
  title: "AI Tools",
  description:
    "Educational directory of AI tools — discover, evaluate, and learn what fits your goals.",
}

export default async function AiToolsPage() {
  const [result, categories, topics] = await Promise.all([
    listPublishedTools({ pageSize: 100, sort: "publishedAt", sortDir: "desc" }),
    listCategories(),
    listTopics(),
  ])

  return (
    <PageShell
      title="AI Tools"
      hideHeader
      width="wide"
      crumbs={[{ label: "AI Tools" }]}
    >
      <ToolDirectoryView
        tools={result.items}
        categories={categories}
        topics={topics}
      />
    </PageShell>
  )
}
