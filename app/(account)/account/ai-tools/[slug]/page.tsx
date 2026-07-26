import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { ToolDetailView } from "@/features/ai-tools"
import { getSession } from "@/features/authentication/server"
import { loadRecommendations } from "@/features/recommendations/server"
import { contentListHref } from "@/lib/content-paths"
import { getPublishedToolBySlug } from "@/services/content"
import { trackContentView } from "@/services/learning"

type PageProps = { params: Promise<{ slug: string }> }

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await getPublishedToolBySlug(slug)
  if (!tool) {
    return { title: "AI tool not found", robots: { index: false, follow: true } }
  }

  return {
    title: tool.name,
    description: tool.shortDescription ?? undefined,
    alternates: { canonical: `${SITE}/ai-tools/${tool.slug}` },
    robots: { index: false, follow: true },
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

  const { items } = await loadRecommendations({
    contextType: "tool",
    contextId: tool.id,
    limit: 6,
    hrefScope: "account",
  })

  return (
    <PageShell
      title={tool.name}
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[
        {
          label: "AI Tools",
          href: contentListHref("ai_tool", { scope: "account" }),
        },
        { label: tool.name },
      ]}
    >
      <ToolDetailView tool={tool} related={items} scope="account" />
    </PageShell>
  )
}
