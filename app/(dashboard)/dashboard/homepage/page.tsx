import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageOverviewView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage CMS",
  robots: { index: false },
}

export default async function HomepageCmsPage() {
  const record = await loadHomepageAdmin()
  return <HomepageOverviewView record={record} />
}
