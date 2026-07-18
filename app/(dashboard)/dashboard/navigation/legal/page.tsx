import type { Metadata } from "next"

import { loadLegalLinks, LegalLinksView } from "@/features/navigation"

export const metadata: Metadata = {
  title: "Legal links",
  robots: { index: false },
}

export default async function Page() {
  const links = await loadLegalLinks()
  return <LegalLinksView links={links} />
}
