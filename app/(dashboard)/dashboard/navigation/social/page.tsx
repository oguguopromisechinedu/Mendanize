import type { Metadata } from "next"

import { loadSocialLinks, SocialLinksView } from "@/features/navigation"

export const metadata: Metadata = {
  title: "Social links",
  robots: { index: false },
}

export default async function Page() {
  const links = await loadSocialLinks()
  return <SocialLinksView links={links} />
}
