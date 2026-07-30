import { notFound } from "next/navigation"

import { GlossaryEditorForm } from "@/features/platform-admin/components/glossary-editor-form"
import { listGlossaryTermsAdmin } from "@/services/platform"

type PageProps = { params: Promise<{ id: string }> }

export default async function EditGlossaryPage({ params }: PageProps) {
  const { id } = await params
  const terms = await listGlossaryTermsAdmin()
  const term = terms.find((t) => t.id === id)
  if (!term) notFound()
  return <GlossaryEditorForm initial={term} />
}
