import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicLearnView } from "@/features/categories-topics"
import { getSession } from "@/features/authentication/server"
import { listGuides, listPublicCategories } from "@/services/content"
import { listContinueLearning } from "@/services/learning"

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Start learning modern technology with Mendanize — categories, guides, articles, and AI tools in one place.",
  openGraph: {
    title: "Learn | Mendanize",
    description: "Structured entry into technology learning on Mendanize.",
  },
}

export default async function LearnPage() {
  const [categories, guides, session] = await Promise.all([
    listPublicCategories(),
    listGuides({ pageSize: 50 }),
    getSession(),
  ])

  const featuredGuides = guides.filter((g) => g.featured).slice(0, 6)
  const displayGuides =
    featuredGuides.length > 0 ? featuredGuides : guides.slice(0, 6)
  const popularGuides = [...guides]
    .sort((a, b) => (b.lessonCount ?? 0) - (a.lessonCount ?? 0))
    .slice(0, 6)
  const recentGuides = [...guides]
    .sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
    )
    .slice(0, 6)

  const continueLearning = session?.user?.id
    ? await listContinueLearning(session.user.id).catch(() => [])
    : []

  return (
    <PageShell
      title="Learn"
      hideHeader
      width="wide"
      crumbs={[{ label: "Learn" }]}
    >
      <PublicLearnView
        categories={categories}
        featuredGuides={displayGuides}
        popularGuides={popularGuides}
        recentGuides={recentGuides}
        continueLearning={continueLearning}
        isSignedIn={!!session?.user?.id}
      />
    </PageShell>
  )
}
