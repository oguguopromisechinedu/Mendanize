import type { Metadata } from "next"

import { MediaCategoriesView } from "@/features/media-library"
import { loadMediaTaxonomy } from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Media categories",
  robots: { index: false },
}

export default async function Page() {
  const { categories } = await loadMediaTaxonomy()
  return <MediaCategoriesView categories={categories} />
}
