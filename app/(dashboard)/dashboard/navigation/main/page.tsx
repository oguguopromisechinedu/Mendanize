import { loadMenuForLocation } from "@/features/navigation/server";
import type { Metadata } from "next"

import { MenuLocationBuilderView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Main navigation",
  robots: { index: false },
}

export default async function Page() {
  const menu = await loadMenuForLocation("MAIN")
  return (
    <MenuLocationBuilderView
      title="Main navigation"
      description="Primary desktop nav with nested items and badges."
      menu={menu}
    />
  )
}
