import { loadSocialLinks } from "@/features/navigation/server";
import type { Metadata } from "next"

import { SocialLinksView } from "@/features/navigation"

export const metadata: Metadata = {
  title: "Social links",
  robots: { index: false },
}

export default async function Page() {
  const links = await loadSocialLinks()
  return <SocialLinksView links={links} />
}
