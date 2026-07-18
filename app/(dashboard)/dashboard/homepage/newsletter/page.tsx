import type { Metadata } from "next"

import {
  HomepageNewsletterView,
  loadHomepageAdmin,
} from "@/features/homepage-management"

export const metadata: Metadata = {
  title: "Homepage newsletter",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageNewsletterView record={record} />
}
