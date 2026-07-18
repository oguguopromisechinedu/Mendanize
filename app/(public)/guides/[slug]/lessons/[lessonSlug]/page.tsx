import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { GuideLessonView } from "@/features/learning-guides"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import {
  flattenGuideLessons,
  getPublishedGuideBySlug,
} from "@/services/content"
import { trackContentView } from "@/services/learning"
import { resolveMetadata } from "@/services/seo"

type PageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) return { title: "Guide not found" }

  const lesson = flattenGuideLessons(guide).find((l) => l.slug === lessonSlug)
  if (!lesson) return { title: "Lesson not found" }

  const meta = await resolveMetadata({
    entityType: "guide",
    entityId: guide.id,
  })

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://mendanize.com"
  const canonical = `${base}/guides/${guide.slug}/lessons/${lesson.slug}`
  const title = `${lesson.title} · ${guide.title}`
  const description =
    lesson.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    meta.description

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      ...(guide.coverImageUrl || lesson.featuredImageUrl
        ? {
            images: [
              {
                url: lesson.featuredImageUrl || guide.coverImageUrl || "",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const { slug, lessonSlug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) notFound()

  const lessons = flattenGuideLessons(guide)
  const idx = lessons.findIndex((l) => l.slug === lessonSlug)
  if (idx < 0) notFound()
  const lesson = lessons[idx]!

  const prev =
    idx > 0
      ? { slug: lessons[idx - 1]!.slug, title: lessons[idx - 1]!.title }
      : null
  const next =
    idx < lessons.length - 1
      ? { slug: lessons[idx + 1]!.slug, title: lessons[idx + 1]!.title }
      : null

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
  const lessonUrl = `${base}/guides/${guide.slug}/lessons/${lesson.slug}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: lesson.title,
    description: `Lesson in ${guide.title}`,
    isPartOf: {
      "@type": "Course",
      name: guide.title,
      ...(meta.structuredData ?? {}),
    },
    url: lessonUrl,
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
        item: `${base}/guides/${guide.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: lesson.title,
        item: lessonUrl,
      },
    ],
  }

  return (
    <PageShell
      title={lesson.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Guides", href: "/guides" },
        { label: guide.title, href: `/guides/${guide.slug}` },
        { label: lesson.title },
      ]}
    >
      <GuideLessonView
        guide={guide}
        lesson={lesson}
        prev={prev}
        next={next}
        related={items}
        structuredData={structuredData}
        breadcrumbJsonLd={breadcrumbJsonLd}
      />
    </PageShell>
  )
}
