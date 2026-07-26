import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { PublicCategoryDetailView } from "@/features/categories-topics"
import { contentListHref } from "@/lib/content-paths"
import {
  getPublishedCategoryBySlug,
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
  const category = await getPublishedCategoryBySlug(slug)
  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: true },
    }
  }

  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
    alternates: { canonical: `${SITE}/categories/${category.slug}` },
    robots: { index: false, follow: true },
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
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        {
          label: "Categories",
          href: contentListHref("category", { scope: "account" }),
        },
        { label: category.name },
      ]}
    >
      <PublicCategoryDetailView
        category={category}
        articles={articles}
        guides={guides}
        tools={toolsResult.items}
        scope="account"
      />
    </PageShell>
  )
}
