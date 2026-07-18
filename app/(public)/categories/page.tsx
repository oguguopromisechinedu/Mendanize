import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicCategoryListView } from "@/features/categories-topics"
import { listPublicCategories } from "@/services/content"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse Mendanize learning categories — organized paths into articles, guides, and AI tools.",
  openGraph: {
    title: "Categories | Mendanize",
    description:
      "Browse learning categories and discover structured technology education.",
  },
}

export default async function CategoriesPage() {
  const categories = await listPublicCategories()

  return (
    <PageShell
      title="Categories"
      hideHeader
      width="wide"
      crumbs={[{ label: "Categories" }]}
    >
      <PublicCategoryListView categories={categories} />
    </PageShell>
  )
}
