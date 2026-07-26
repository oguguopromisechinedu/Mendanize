import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicCategoryListView } from "@/features/categories-topics"
import { listPublicCategories } from "@/services/content"

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse Mendanize learning categories — organized paths into articles, guides, and AI tools.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/categories` },
}

export default async function CategoriesPage() {
  const categories = await listPublicCategories()

  return (
    <PageShell
      title="Categories"
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[{ label: "Categories" }]}
    >
      <PublicCategoryListView categories={categories} scope="account" />
    </PageShell>
  )
}
