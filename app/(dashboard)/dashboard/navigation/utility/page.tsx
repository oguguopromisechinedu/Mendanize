import { loadMenuForLocation } from "@/features/navigation/server";
import type { Metadata } from "next"

import { MenuLocationBuilderView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Utility navigation",
  robots: { index: false },
}

export default async function Page() {
  const menu = await loadMenuForLocation("UTILITY")
  return (
    <MenuLocationBuilderView
      title="Utility navigation"
      description="Header utility bar links."
      menu={menu}
    />
  )
}
