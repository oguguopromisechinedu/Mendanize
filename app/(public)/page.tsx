import type { Metadata } from "next"

import { HomepageView } from "@/features/homepage-public"
import { loadHomepage } from "@/features/homepage-public/server"

export const metadata: Metadata = {
  title: "Learn technology with clarity",
  description:
    "Mendanize is an AI-powered technology learning platform — articles, guides, curated tools, and structured learning paths.",
}

/**
 * Premium homepage (MES-005).
 * Section content/order/visibility comes from Content Service seed — CMS in MES-013.
 */
export default async function PublicHomePage() {
  const content = await loadHomepage()
  return <HomepageView content={content} />
}
