import type { Metadata } from "next"

import { SeoTemplatesView } from "@/features/seo"
import { loadSeoTemplates } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Metadata templates",
  robots: { index: false },
}

export default async function Page() {
  const templates = await loadSeoTemplates()
  return <SeoTemplatesView templates={templates} />
}
