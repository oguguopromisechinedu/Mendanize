import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import { FreeResourceDownloadButton } from "@/features/free-resources/components/download-button"
import { getPublishedFreeResourceBySlug } from "@/services/platform"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resource = await getPublishedFreeResourceBySlug(slug)
  if (!resource) return { title: "Resource not found" }
  return {
    title: resource.seoTitle || resource.title,
    description: resource.seoDescription || resource.description || undefined,
  }
}

export default async function FreeResourceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const resource = await getPublishedFreeResourceBySlug(slug)
  if (!resource) notFound()

  return (
    <PageShell
      title={resource.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Free Resources", href: "/free-resources" },
        { label: resource.title },
      ]}
    >
      <article className="mx-auto max-w-3xl">
        <Badge variant="secondary">{resource.type}</Badge>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {resource.title}
        </h1>
        {resource.description ? (
          <p className="mt-4 text-lg text-muted-foreground">
            {resource.description}
          </p>
        ) : null}
        <div className="mt-8">
          <FreeResourceDownloadButton
            resourceId={resource.id}
            fileUrl={resource.fileUrl}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Prefer guided learning?{" "}
          <Link href="/ai-courses" className="text-primary hover:underline">
            Browse AI Courses
          </Link>
          .
        </p>
      </article>
    </PageShell>
  )
}
