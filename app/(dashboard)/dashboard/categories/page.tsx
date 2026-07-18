import type { Metadata } from "next"

import { CategoryListView, loadCategoryList } from "@/features/categories-topics"

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false },
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadCategoryList({
    query: typeof raw.query === "string" ? raw.query : undefined,
    pageSize: 50,
  })
  return <CategoryListView initial={initial} />
}
