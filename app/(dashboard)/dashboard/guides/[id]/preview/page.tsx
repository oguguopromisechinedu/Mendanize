import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { GuidePreviewView } from "@/features/learning-guides"
import { loadRecommendations } from "@/features/recommendations/server"
import { getGuideById } from "@/services/content"

export const metadata: Metadata = {
  title: "Preview guide",
  robots: { index: false },
}

export default async function PreviewGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guide = await getGuideById(id)
  if (!guide) notFound()
  const { items } = await loadRecommendations({
    contextType: "guide",
    contextId: guide.id,
    limit: 6,
  })
  return <GuidePreviewView guide={guide} related={items} />
}
