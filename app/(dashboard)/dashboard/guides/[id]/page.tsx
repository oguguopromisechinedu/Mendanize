import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { GuideEditorForm, loadGuideEditor } from "@/features/learning-guides"

export const metadata: Metadata = {
  title: "Edit guide",
  robots: { index: false },
}

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { guide, options } = await loadGuideEditor(id)
  if (!guide) notFound()
  return <GuideEditorForm guide={guide} options={options} />
}
