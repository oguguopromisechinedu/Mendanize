import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageSectionsView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage sections",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageSectionsView record={record} />
}
