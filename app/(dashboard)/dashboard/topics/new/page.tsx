import type { Metadata } from "next"

import { TopicEditorForm, loadTopicEditor } from "@/features/categories-topics"

export const metadata: Metadata = {
  title: "New topic",
  robots: { index: false },
}

export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initialCategoryId =
    typeof raw.categoryId === "string" ? raw.categoryId : undefined
  const { categories, mediaPlaceholders } = await loadTopicEditor()
  return (
    <TopicEditorForm
      categories={categories}
      mediaPlaceholders={mediaPlaceholders}
      initialCategoryId={initialCategoryId}
    />
  )
}
