import type { Metadata } from "next"

import { MediaLibraryView } from "@/features/media-library"
import {
  loadMediaLibrary,
  loadMediaOptions,
} from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Media Library",
  robots: { index: false },
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const [initial, options] = await Promise.all([
    loadMediaLibrary({
      query: typeof raw.query === "string" ? raw.query : undefined,
      pageSize: 48,
    }),
    loadMediaOptions(),
  ])
  return <MediaLibraryView initial={initial} options={options} />
}
