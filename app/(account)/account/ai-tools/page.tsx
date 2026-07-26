import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { ToolDirectoryView } from "@/features/ai-tools"
import {
  listCategories,
  listPublishedTools,
  listTopics,
} from "@/services/content"

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export const metadata: Metadata = {
  title: "AI Tools",
  description:
    "Educational directory of AI tools — discover, evaluate, and learn what fits your goals.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/ai-tools` },
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
      homeHref="/account"
      homeLabel="Account"
      crumbs={[{ label: "AI Tools" }]}
    >
      <ToolDirectoryView
        tools={result.items}
        categories={categories}
        topics={topics}
        scope="account"
      />
    </PageShell>
  )
}
