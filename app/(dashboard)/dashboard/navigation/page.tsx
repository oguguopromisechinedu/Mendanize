import { loadNavigationOverview } from "@/features/navigation/server";
import type { Metadata } from "next"

import { NavigationOverviewView } from "@/features/navigation";

export const metadata: Metadata = {
  title: "Navbar Manager",
  robots: { index: false },
}

export default async function Page() {
  const overview = await loadNavigationOverview()
  return <NavigationOverviewView overview={overview} />
}
