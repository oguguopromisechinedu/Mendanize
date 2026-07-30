import { loadMenuForLocation } from "@/features/navigation/server";
import type { Metadata } from "next"

import { MenuLocationBuilderView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Footer navigation",
  robots: { index: false },
}

export default async function Page() {
  const menu = await loadMenuForLocation("FOOTER")
  return (
    <MenuLocationBuilderView
      title="Footer navigation"
      description="Top-level items become footer columns; children become column links."
      menu={menu}
    />
  )
}
