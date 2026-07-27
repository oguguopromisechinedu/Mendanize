import type { Metadata } from "next"

import { ToolEditorForm, loadToolEditor } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Add marketplace AI tool",
  robots: { index: false },
}

export default async function Page() {
  const { options } = await loadToolEditor()
  return (
    <ToolEditorForm
      options={options}
      basePath="/dashboard/marketplace/tools"
    />
  )
}
