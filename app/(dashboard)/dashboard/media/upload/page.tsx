import type { Metadata } from "next"

import { MediaUploadView } from "@/features/media-library"
import { loadMediaOptions } from "@/features/media-library/server"

export const metadata: Metadata = {
  title: "Upload media",
  robots: { index: false },
}

export default async function Page() {
  const options = await loadMediaOptions()
  return <MediaUploadView options={options} />
}
