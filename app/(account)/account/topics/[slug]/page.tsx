import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { PublicTopicDetailView } from "@/features/categories-topics"
import { contentListHref } from "@/lib/content-paths"
import {
  getCategoryById,
  getPublishedTopicBySlug,
  listArticles,
  listGuides,
  listPublishedTools,
} from "@/services/content"

type PageProps = { params: Promise<{ slug: string }> }

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const topic = await getPublishedTopicBySlug(slug)
  if (!topic) {
    return { title: "Topic not found", robots: { index: false, follow: true } }
  }

  return {
    title: topic.seoTitle ?? topic.name,
    description: topic.seoDescription ?? topic.description ?? undefined,
    alternates: { canonical: `${SITE}/topics/${topic.slug}` },
    robots: { index: false, follow: true },
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
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        { label: "Topics", href: contentListHref("topic", { scope: "account" }) },
        { label: topic.name },
      ]}
    >
      <PublicTopicDetailView
        topic={topic}
        categorySlug={category?.slug}
        articles={articles}
        guides={guides}
        tools={toolsResult.items}
        scope="account"
      />
    </PageShell>
  )
}
