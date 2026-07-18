import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { PublicTopicDetailView } from "@/features/categories-topics"
import {
  getCategoryById,
  getPublishedTopicBySlug,
  listArticles,
  listGuides,
  listPublishedTools,
} from "@/services/content"
import { resolveMetadata } from "@/services/seo"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const topic = await getPublishedTopicBySlug(slug)
  if (!topic) return { title: "Topic not found" }

  const meta = await resolveMetadata({
    entityType: "topic",
    entityId: topic.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical =
    meta.canonicalUrl ||
    topic.canonicalUrl ||
    `${base}/topics/${topic.slug}`

  return {
    title: meta.title ?? topic.seoTitle ?? topic.name,
    description:
      meta.description ?? topic.seoDescription ?? topic.description ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: meta.title ?? topic.name,
      description: meta.description ?? topic.description ?? undefined,
      url: canonical,
    },
    robots: { index: true, follow: true },
  }
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug } = await params
  const topic = await getPublishedTopicBySlug(slug)
  if (!topic) notFound()

  const category = topic.categoryId
    ? await getCategoryById(topic.categoryId)
    : null

  const [articles, guides, toolsResult] = await Promise.all([
    listArticles({ topicId: topic.id, pageSize: 12 }),
    listGuides({ topicId: topic.id, pageSize: 12 }),
    listPublishedTools({ topicId: topic.id, pageSize: 12 }),
  ])

  return (
    <PageShell
      title={topic.name}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Topics", href: "/topics" },
        { label: topic.name },
      ]}
    >
      <PublicTopicDetailView
        topic={topic}
        categorySlug={category?.slug}
        articles={articles}
        guides={guides}
        tools={toolsResult.items}
      />
    </PageShell>
  )
}
