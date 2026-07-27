import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ToolPreviewView } from "@/features/ai-tools"
import { loadRecommendations } from "@/features/recommendations/server"
import { getToolById } from "@/services/content"

export const metadata: Metadata = {
  title: "Preview marketplace AI tool",
  robots: { index: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tool = await getToolById(id)
  if (!tool) notFound()
  const { items } = await loadRecommendations({
    contextType: "tool",
    contextId: tool.id,
    limit: 6,
  })
  return <ToolPreviewView tool={tool} related={items} />
}
