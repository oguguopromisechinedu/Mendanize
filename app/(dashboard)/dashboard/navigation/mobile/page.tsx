import { loadMenuForLocation } from "@/features/navigation/server";
import type { Metadata } from "next"

import { MenuLocationBuilderView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Mobile navigation",
  robots: { index: false },
}

export default async function Page() {
  const menu = await loadMenuForLocation("MOBILE")
  return (
    <MenuLocationBuilderView
      title="Mobile navigation"
      description="Independent from desktop — collapsible groups in the mobile sheet."
      menu={menu}
    />
  )
}
