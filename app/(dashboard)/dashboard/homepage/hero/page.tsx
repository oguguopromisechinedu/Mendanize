import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageHeroView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage hero",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageHeroView record={record} />
}
