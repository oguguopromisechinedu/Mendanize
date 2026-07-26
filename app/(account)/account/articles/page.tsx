import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicArticleListView } from "@/features/articles"
import { listArticles } from "@/services/content"

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Educational articles on AI, web development, and modern technology from Mendanize.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/articles` },
}

export default async function Page() {
  const articles = await listArticles({ pageSize: 48 })
  return (
    <PageShell
      title="Articles"
      hideHeader
      homeHref="/account"
      homeLabel="Account"
      crumbs={[{ label: "Articles" }]}
    >
      <PublicArticleListView articles={articles} scope="account" />
    </PageShell>
  )
}
