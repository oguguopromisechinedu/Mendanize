import { loadFeaturedPickerOptions, loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageFeaturedView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage featured",
  robots: { index: false },
}

export default async function Page() {
  const [record, options] = await Promise.all([
    loadHomepageAdmin(),
    loadFeaturedPickerOptions(),
  ])
  return <HomepageFeaturedView record={record} options={options} />
}
