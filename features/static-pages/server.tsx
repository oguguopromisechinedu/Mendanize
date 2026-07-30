import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import {
  getPageById,
  getPublishedPageBySlug,
  type StaticPageRecord,
} from "@/services/admin"
import { CmsPageView } from "./components/cms-page-view"

function appBase() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  )
}

export function buildCmsPageMetadata(page: StaticPageRecord): Metadata {
  const title = page.seoTitle || page.title
  const description = page.seoDescription || page.excerpt || undefined
  const canonical = `${appBase()}/${page.slug}`
  const image = page.featuredImageUrl || undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export async function generateCmsPageMetadata(
  slug: string
): Promise<Metadata> {
  const page = await getPublishedPageBySlug(slug)
  if (!page) return { title: "Page not found" }
  return buildCmsPageMetadata(page)
}

/** Public company page — 404 when missing or unpublished. */
export async function CmsCompanyPage({ slug }: { slug: string }) {
  const page = await getPublishedPageBySlug(slug)
  if (!page) notFound()
  return (
    <PageShell title={page.title} hideHeader width="wide" crumbs={[{ label: page.title }]}>
      <CmsPageView page={page} />
    </PageShell>
  )
}

/** Admin preview — renders draft/review/published content. */
export async function CmsPagePreview({ id }: { id: string }) {
  const page = await getPageById(id)
  if (!page) notFound()
  return (
    <PageShell
      title={page.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Pages", href: "/dashboard/pages" },
        { label: "Preview" },
      ]}
    >
      <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Preview — status: {page.status}
        {page.status !== "PUBLISHED"
          ? " (not visible on the public site until published)"
          : ""}
      </div>
      <CmsPageView page={page} />
    </PageShell>
  )
}
