import type { Metadata } from "next"
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
  if (!guide) {
    return { title: "Guide not found" }
  }

  const meta = await resolveMetadata({
    entityType: "guide",
    entityId: guide.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical =
    meta.canonicalUrl ||
    guide.canonicalUrl ||
    `${base}/guides/${guide.slug}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: meta.openGraph?.title ?? meta.title,
      description: meta.openGraph?.description ?? meta.description,
      url: canonical,
      type: "website",
      ...(meta.openGraph?.image
        ? { images: [{ url: meta.openGraph.image }] }
        : guide.coverImageUrl
          ? { images: [{ url: guide.coverImageUrl }] }
          : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      ...(meta.openGraph?.image || guide.coverImageUrl
        ? {
            images: [meta.openGraph?.image || guide.coverImageUrl || ""],
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
  const shareUrl = `${base}/guides/${guide.slug}`

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
    author: {
      "@type": "Person",
      name: guide.authorName ?? "Mendanize Editorial",
    },
    timeRequired: `PT${guide.estimatedMinutes}M`,
    image: guide.coverImageUrl ?? undefined,
    url: shareUrl,
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
        name: "Guides",
        item: `${base}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: shareUrl,
      },
    ],
  }

  return (
    <PageShell
      title={guide.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Guides", href: "/guides" },
        { label: guide.title },
      ]}
    >
      <GuideOverviewView
        guide={guide}
        related={items}
        structuredData={structuredData}
        breadcrumbJsonLd={breadcrumbJsonLd}
      />
    </PageShell>
  )
}
