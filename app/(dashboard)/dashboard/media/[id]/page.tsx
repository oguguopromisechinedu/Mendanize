import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MediaAssetDetailView } from "@/features/media-library"
import { loadMediaAsset } from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Asset details",
  robots: { index: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { asset, options } = await loadMediaAsset(id)
  if (!asset) notFound()
  return <MediaAssetDetailView asset={asset} options={options} />
}
