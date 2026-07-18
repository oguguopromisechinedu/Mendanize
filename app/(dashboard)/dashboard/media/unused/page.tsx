import type { Metadata } from "next"

import { MediaLibraryView } from "@/features/media-library"
import {
  loadMediaLibrary,
  loadMediaOptions,
} from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Unused assets",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const [initial, options] = await Promise.all([
    loadMediaLibrary({
      unusedOnly: true,
      query: typeof raw.query === "string" ? raw.query : undefined,
      pageSize: 48,
    }),
    loadMediaOptions(),
  ])
  return (
    <MediaLibraryView
      initial={initial}
      options={options}
      title="Unused assets"
      description="Active assets with zero recorded usage."
      basePath="/dashboard/media/unused"
    />
  )
}
