import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TopicEditorForm, loadTopicEditor } from "@/features/categories-topics"

export const metadata: Metadata = {
  title: "Edit topic",
  robots: { index: false },
}

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { topic, categories, mediaPlaceholders } = await loadTopicEditor(id)
  if (!topic) notFound()
  return (
    <TopicEditorForm
      topic={topic}
      categories={categories}
      mediaPlaceholders={mediaPlaceholders}
    />
  )
}
