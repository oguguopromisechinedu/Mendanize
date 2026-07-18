import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { ArticleReadingView } from "@/features/articles"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import {
  getPublishedArticleBySlug,
} from "@/services/content"
import { trackContentView } from "@/services/learning"
import { resolveMetadata } from "@/services/seo"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) {
    return { title: "Article not found" }
  }

  const meta = await resolveMetadata({
    entityType: "article",
    entityId: article.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical =
    meta.canonicalUrl ||
    article.canonicalUrl ||
    `${base}/articles/${article.slug}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: meta.openGraph?.title ?? meta.title,
      description: meta.openGraph?.description ?? meta.description,
      url: canonical,
      type: "article",
      ...(meta.openGraph?.image
        ? { images: [{ url: meta.openGraph.image }] }
        : article.featuredImageUrl
          ? { images: [{ url: article.featuredImageUrl }] }
          : {}),
      ...(article.publishedAt
        ? { publishedTime: article.publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      ...(meta.twitter?.image || meta.openGraph?.image || article.socialImageUrl
        ? {
            images: [
              meta.twitter?.image ||
                meta.openGraph?.image ||
                article.socialImageUrl ||
                "",
            ],
          }
        : {}),
    },
    robots: meta.robots
      ? {
          index: meta.robots.index,
          follow: meta.robots.follow,
        }
      : { index: true, follow: true },
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

  const [{ items }, meta] = await Promise.all([
    loadRecommendations({
      contextType: "article",
      contextId: article.id,
      limit: 6,
    }),
    resolveMetadata({ entityType: "article", entityId: article.id }),
  ])

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const shareUrl = `${base}/articles/${article.slug}`

  const structuredData = {
    "@context": "https://schema.org",
    ...(meta.structuredData ?? {
      "@type": "Article",
      headline: article.title,
    }),
    author: {
      "@type": "Person",
      name: article.authorName ?? "Mendanize Editorial",
    },
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    image: article.featuredImageUrl ?? undefined,
    mainEntityOfPage: shareUrl,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${base}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${base}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: shareUrl,
      },
    ],
  }

  return (
    <PageShell
      title={article.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Articles", href: "/articles" },
        { label: article.title },
      ]}
    >
      <ArticleReadingView
        article={article}
        related={items}
        shareUrl={shareUrl}
        structuredData={structuredData}
        breadcrumbJsonLd={breadcrumbJsonLd}
      />
    </PageShell>
  )
}
