import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageAskView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage Ask copy",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageAskView record={record} />
}
