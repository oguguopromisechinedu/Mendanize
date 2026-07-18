import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TopicDetailView, loadTopicDetails } from "@/features/categories-topics"

export const metadata: Metadata = {
  title: "Topic details",
  robots: { index: false },
}

export default async function TopicDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await loadTopicDetails(id)
  if (!detail) notFound()
  return <TopicDetailView detail={detail} />
}
