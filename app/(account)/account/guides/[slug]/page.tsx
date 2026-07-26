import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { GuideOverviewView } from "@/features/learning-guides"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { contentListHref } from "@/lib/content-paths"
import { getPublishedGuideBySlug } from "@/services/content"
import { trackContentView } from "@/services/learning"

type PageProps = { params: Promise<{ slug: string }> }

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = await getPublishedGuideBySlug(slug)
  if (!guide) {
    return { title: "Guide not found", robots: { index: false, follow: true } }
  }

  return {
    title: guide.title,
    description: guide.shortDescription ?? undefined,
    alternates: { canonical: `${SITE}/guides/${guide.slug}` },
    robots: { index: false, follow: true },
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

  const { items } = await loadRecommendations({
    contextType: "guide",
    contextId: guide.id,
    limit: 6,
    hrefScope: "account",
  })

  return (
    <PageShell
      title={guide.title}
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        { label: "Guides", href: contentListHref("guide", { scope: "account" }) },
        { label: guide.title },
      ]}
    >
      <GuideOverviewView guide={guide} related={items} scope="account" />
    </PageShell>
  )
}
