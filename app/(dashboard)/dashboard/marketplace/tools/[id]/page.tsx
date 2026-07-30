import { loadToolEditor } from "@/features/ai-tools/server";
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ToolEditorForm } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Edit marketplace AI tool",
  robots: { index: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { tool, options } = await loadToolEditor(id)
  if (!tool) notFound()
  return (
    <ToolEditorForm
      tool={tool}
      options={options}
      basePath="/dashboard/marketplace/tools"
    />
  )
}
