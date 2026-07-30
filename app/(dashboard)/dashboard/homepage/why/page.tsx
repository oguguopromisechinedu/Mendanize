import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageWhyView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage Why section",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageWhyView record={record} />
}
