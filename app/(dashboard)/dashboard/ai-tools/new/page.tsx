import { loadToolEditor } from "@/features/ai-tools/server";
import type { Metadata } from "next"

import { ToolEditorForm } from "@/features/ai-tools"

export const metadata: Metadata = {
  title: "Add AI tool",
  robots: { index: false },
}

export default async function NewAiToolPage() {
  const { options } = await loadToolEditor()
  return <ToolEditorForm options={options} />
}
