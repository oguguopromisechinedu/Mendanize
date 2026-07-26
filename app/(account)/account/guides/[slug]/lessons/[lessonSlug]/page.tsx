import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { GuideLessonView } from "@/features/learning-guides"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { contentHref, contentListHref } from "@/lib/content-paths"
import {
  flattenGuideLessons,
  getPublishedGuideBySlug,
} from "@/services/content"
import { trackContentView } from "@/services/learning"

type PageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>
}

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) {
    return { title: "Guide not found", robots: { index: false, follow: true } }
  }

  const lesson = flattenGuideLessons(guide).find((l) => l.slug === lessonSlug)
  if (!lesson) {
    return { title: "Lesson not found", robots: { index: false, follow: true } }
  }

  return {
    title: `${lesson.title} · ${guide.title}`,
    alternates: {
      canonical: `${SITE}/guides/${guide.slug}/lessons/${lesson.slug}`,
    },
    robots: { index: false, follow: true },
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

  const { items } = await loadRecommendations({
    contextType: "guide",
    contextId: guide.id,
    limit: 6,
    hrefScope: "account",
  })

  return (
    <PageShell
      title={lesson.title}
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        { label: "Guides", href: contentListHref("guide", { scope: "account" }) },
        {
          label: guide.title,
          href: contentHref("guide", guide.slug, { scope: "account" }),
        },
        { label: lesson.title },
      ]}
    >
      <GuideLessonView
        guide={guide}
        lesson={lesson}
        prev={prev}
        next={next}
        related={items}
        scope="account"
      />
    </PageShell>
  )
}
