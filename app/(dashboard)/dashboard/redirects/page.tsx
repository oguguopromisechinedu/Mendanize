import type { Metadata } from "next"

import { SeoRedirectsView } from "@/features/seo"
import { loadRedirects } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Redirects",
  robots: { index: false },
}

export default async function Page() {
  const redirects = await loadRedirects()
  return <SeoRedirectsView redirects={redirects} />
}
