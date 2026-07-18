import type { Metadata } from "next"

import { SeoSitemapView } from "@/features/seo"
import { loadSitemap } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Sitemap",
  robots: { index: false },
}

export default async function Page() {
  const configs = await loadSitemap()
  return <SeoSitemapView configs={configs} />
}
