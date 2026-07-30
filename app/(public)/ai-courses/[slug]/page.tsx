import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { GuideOverviewView } from "@/features/learning-guides"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { getPublishedGuideBySlug } from "@/services/content"
import { trackContentView } from "@/services/learning"
import { resolveMetadata } from "@/services/seo"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) return { title: "Course not found" }

  const meta = await resolveMetadata({
    entityType: "guide",
    entityId: guide.id,
  })
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical = `${base}/ai-courses/${guide.slug}`

  return {
    title: `${guide.title} — AI Course`,
    description: meta.description ?? guide.shortDescription ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: guide.title,
      description: guide.shortDescription ?? undefined,
      url: canonical,
      type: "website",
      ...(guide.coverImageUrl
        ? { images: [{ url: guide.coverImageUrl }] }
        : {}),
    },
  }
}

export default async function AiCourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) notFound()

  const session = await getSession()
  if (session?.user?.id) {
    await trackContentView({
      userId: session.user.id,
      entityType: "guide",
      entityId: guide.id,
    })
  }

  const [{ items }, meta] = await Promise.all([
    loadRecommendations({
      contextType: "guide",
      contextId: guide.id,
      limit: 6,
    }),
    resolveMetadata({ entityType: "guide", entityId: guide.id }),
  ])

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const shareUrl = `${base}/ai-courses/${guide.slug}`

  const structuredData = {
    "@context": "https://schema.org",
    ...(meta.structuredData ?? {
      "@type": "Course",
      name: guide.title,
    }),
    description: guide.shortDescription ?? undefined,
    provider: {
      "@type": "Organization",
      name: "Mendanize",
    },
    url: shareUrl,
    image: guide.coverImageUrl ?? undefined,
  }

  return (
    <PageShell
      title={guide.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "AI Courses", href: "/ai-courses" },
        { label: guide.title },
      ]}
    >
      <p className="mb-6 text-sm text-muted-foreground">
        AI Course ·{" "}
        <Link href={`/guides/${guide.slug}`} className="text-primary hover:underline">
          Classic guide view
        </Link>
      </p>
      <GuideOverviewView
        guide={guide}
        related={items}
        structuredData={structuredData}
      />
    </PageShell>
  )
}
