import type { Metadata } from "next"

import { SeoStructuredDataView } from "@/features/seo"
import { loadStructuredData } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Structured data",
  robots: { index: false },
}

export default async function Page() {
  const items = await loadStructuredData()
  return <SeoStructuredDataView items={items} />
}
