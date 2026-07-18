import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  CategoryEditorForm,
  loadCategoryEditor,
} from "@/features/categories-topics"

export const metadata: Metadata = {
  title: "Edit category",
  robots: { index: false },
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { category, mediaPlaceholders } = await loadCategoryEditor(id)
  if (!category) notFound()
  return (
    <CategoryEditorForm
      category={category}
      mediaPlaceholders={mediaPlaceholders}
    />
  )
}
