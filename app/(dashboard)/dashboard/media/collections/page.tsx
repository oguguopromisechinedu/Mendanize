import type { Metadata } from "next"

import { MediaCollectionsView } from "@/features/media-library"
import { loadMediaTaxonomy } from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Media collections",
  robots: { index: false },
}

export default async function Page() {
  const { collections } = await loadMediaTaxonomy()
  return <MediaCollectionsView collections={collections} />
}
