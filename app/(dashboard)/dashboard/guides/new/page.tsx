import { loadGuideEditor } from "@/features/learning-guides/server";
import type { Metadata } from "next"

import { GuideEditorForm } from "@/features/learning-guides"

export const metadata: Metadata = {
  title: "New guide",
  robots: { index: false },
}

export default async function NewGuidePage() {
  const { options } = await loadGuideEditor()
  return <GuideEditorForm options={options} />
}
