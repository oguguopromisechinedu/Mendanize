import type { Metadata } from "next"

import { CmsPagePreview } from "@/features/static-pages/server"

export const metadata: Metadata = {
  title: "Preview page",
  robots: { index: false },
}

export default async function PreviewPagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CmsPagePreview id={id} />
}
