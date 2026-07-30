import { loadLocationsAndMenus } from "@/features/navigation/server";
import type { Metadata } from "next"

import { LocationsView } from "@/features/navigation"

export const metadata: Metadata = {
  title: "Menu locations",
  robots: { index: false },
}

export default async function Page() {
  const { locations, menus } = await loadLocationsAndMenus()
  return <LocationsView locations={locations} menus={menus} />
}
