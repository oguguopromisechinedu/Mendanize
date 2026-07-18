import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicArticleListView } from "@/features/articles"
import { listArticles } from "@/services/content"

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Educational articles on AI, web development, and modern technology from Mendanize.",
  openGraph: {
    title: "Articles | Mendanize",
    description:
      "Educational articles on AI, web development, and modern technology.",
  },
}

export default async function Page() {
  const articles = await listArticles({ pageSize: 48 })
  return (
    <PageShell
      title="Articles"
      hideHeader
      crumbs={[{ label: "Articles" }]}
    >
      <PublicArticleListView articles={articles} />
    </PageShell>
  )
}
