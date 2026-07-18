import type { Metadata } from "next"

import {
  HomepageCtaView,
  loadHomepageAdmin,
} from "@/features/homepage-management"

export const metadata: Metadata = {
  title: "Homepage final CTA",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageCtaView record={record} />
}
