import type { Metadata } from "next"

import {
  loadMenuForLocation,
  MenuLocationBuilderView,
} from "@/features/navigation"

export const metadata: Metadata = {
  title: "Quick links",
  robots: { index: false },
}

export default async function Page() {
  const menu = await loadMenuForLocation("QUICK_LINKS")
  return (
    <MenuLocationBuilderView
      title="Quick links"
      description="Lightweight action links (Ask Mendanize and similar)."
      menu={menu}
    />
  )
}
