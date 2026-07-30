import { notFound } from "next/navigation"

import { ResourceEditorForm } from "@/features/platform-admin/components/resource-editor-form"
import { listFreeResourcesAdmin } from "@/services/platform"

type PageProps = { params: Promise<{ id: string }> }

export default async function EditResourcePage({ params }: PageProps) {
  const { id } = await params
  const resources = await listFreeResourcesAdmin()
  const resource = resources.find((r) => r.id === id)
  if (!resource) notFound()
  return <ResourceEditorForm initial={resource} />
}
