import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { ArticleReadingView } from "@/features/articles"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { contentListHref } from "@/lib/content-paths"
import { getPublishedArticleBySlug } from "@/services/content"
import { trackContentView } from "@/services/learning"

type PageProps = { params: Promise<{ slug: string }> }

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) {
    return { title: "Article not found", robots: { index: false, follow: true } }
  }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `${SITE}/articles/${article.slug}` },
    robots: { index: false, follow: true },
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) notFound()

  const session = await getSession()
  if (session?.user?.id) {
    await trackContentView({
      userId: session.user.id,
      entityType: "article",
      entityId: article.id,
    })
  }

  const { items } = await loadRecommendations({
    contextType: "article",
    contextId: article.id,
    limit: 6,
    hrefScope: "account",
  })

  const shareUrl = `${SITE}/articles/${article.slug}`

  return (
    <PageShell
      title={article.title}
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        {
          label: "Articles",
          href: contentListHref("article", { scope: "account" }),
        },
        { label: article.title },
      ]}
    >
      <ArticleReadingView
        article={article}
        related={items}
        shareUrl={shareUrl}
        scope="account"
      />
    </PageShell>
  )
}
