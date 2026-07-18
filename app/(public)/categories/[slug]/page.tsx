import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { PublicCategoryDetailView } from "@/features/categories-topics"
import {
  getPublishedCategoryBySlug,
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
  const category = await getPublishedCategoryBySlug(slug)
  if (!category) return { title: "Category not found" }

  const meta = await resolveMetadata({
    entityType: "category",
    entityId: category.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical =
    meta.canonicalUrl ||
    category.canonicalUrl ||
    `${base}/categories/${category.slug}`

  return {
    title: meta.title ?? category.seoTitle ?? category.name,
    description:
      meta.description ?? category.seoDescription ?? category.description ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: meta.title ?? category.name,
      description: meta.description ?? category.description ?? undefined,
      url: canonical,
    },
    robots: { index: true, follow: true },
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getPublishedCategoryBySlug(slug)
  if (!category) notFound()

  const [articles, guides, toolsResult] = await Promise.all([
    listArticles({ categoryId: category.id, pageSize: 12 }),
    listGuides({ categoryId: category.id, pageSize: 12 }),
    listPublishedTools({ categoryId: category.id, pageSize: 12 }),
  ])

  return (
    <PageShell
      title={category.name}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Categories", href: "/categories" },
        { label: category.name },
      ]}
    >
      <PublicCategoryDetailView
        category={category}
        articles={articles}
        guides={guides}
        tools={toolsResult.items}
      />
    </PageShell>
  )
}
