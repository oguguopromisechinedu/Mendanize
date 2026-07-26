import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicTopicListView } from "@/features/categories-topics"
import { listPublicCategories, listPublicTopics } from "@/services/content"

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Focused learning topics across Mendanize — articles, guides, and tools for every subject.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/topics` },
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
      homeHref="/account"
      homeLabel="Account"
      crumbs={[{ label: "Topics" }]}
    >
      <PublicTopicListView
        topics={topics}
        categories={categories}
        scope="account"
      />
    </PageShell>
  )
}
