import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { ToolDetailView } from "@/features/ai-tools"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { getPublishedToolBySlug } from "@/services/content"
import { trackContentView } from "@/services/learning"
import { resolveMetadata } from "@/services/seo"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await getPublishedToolBySlug(slug)
  if (!tool) {
    return { title: "AI tool not found" }
  }

  const meta = await resolveMetadata({
    entityType: "ai_tool",
    entityId: tool.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical =
    meta.canonicalUrl ||
    tool.canonicalUrl ||
    `${base}/ai-tools/${tool.slug}`

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
        : tool.coverUrl || tool.logoUrl
          ? { images: [{ url: tool.coverUrl || tool.logoUrl || "" }] }
          : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      ...(meta.openGraph?.image || tool.coverUrl || tool.logoUrl
        ? {
            images: [
              meta.openGraph?.image || tool.coverUrl || tool.logoUrl || "",
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
  const tool = await getPublishedToolBySlug(slug)
  if (!tool) notFound()

  const session = await getSession()
  if (session?.user?.id) {
    await trackContentView({
      userId: session.user.id,
      entityType: "ai_tool",
      entityId: tool.id,
    })
  }

  const [{ items }, meta] = await Promise.all([
    loadRecommendations({
      contextType: "tool",
      contextId: tool.id,
      limit: 6,
    }),
    resolveMetadata({ entityType: "ai_tool", entityId: tool.id }),
  ])

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const shareUrl = `${base}/ai-tools/${tool.slug}`

  const structuredData = {
    "@context": "https://schema.org",
    ...(meta.structuredData ?? {
      "@type": "SoftwareApplication",
      name: tool.name,
    }),
    description: tool.shortDescription ?? undefined,
    applicationCategory: "EducationalApplication",
    operatingSystem: tool.platforms.join(", ") || undefined,
    url: tool.websiteUrl || shareUrl,
    image: tool.coverUrl || tool.logoUrl || undefined,
    offers: {
      "@type": "Offer",
      price: tool.pricing,
      priceCurrency: "USD",
    },
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
        name: "AI Tools",
        item: `${base}/ai-tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: shareUrl,
      },
    ],
  }

  return (
    <PageShell
      title={tool.name}
      hideHeader
      width="wide"
      crumbs={[
        { label: "AI Tools", href: "/ai-tools" },
        { label: tool.name },
      ]}
    >
      <ToolDetailView
        tool={tool}
        related={items}
        structuredData={structuredData}
        breadcrumbJsonLd={breadcrumbJsonLd}
      />
    </PageShell>
  )
}
