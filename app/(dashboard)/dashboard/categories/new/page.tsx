import { loadCategoryEditor } from "@/features/categories-topics/server";
import type { Metadata } from "next"

import { CategoryEditorForm } from "@/features/categories-topics";

export const metadata: Metadata = {
  title: "New category",
  robots: { index: false },
}

export default async function NewCategoryPage() {
  const { mediaPlaceholders } = await loadCategoryEditor()
  return <CategoryEditorForm mediaPlaceholders={mediaPlaceholders} />
}
