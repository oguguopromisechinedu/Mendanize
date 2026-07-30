import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageEditorForm } from "@/features/static-pages"
import { getPageById } from "@/services/admin"

export const metadata: Metadata = {
  title: "Edit page",
  robots: { index: false },
}

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await getPageById(id)
  if (!page) notFound()
  return <PageEditorForm page={page} />
}
