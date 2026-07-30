import { loadFeaturedPickerOptions, loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageLatestArticlesView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage latest articles",
  robots: { index: false },
}

export default async function Page() {
  const [record, options] = await Promise.all([
    loadHomepageAdmin(),
    loadFeaturedPickerOptions(),
  ])
  return <HomepageLatestArticlesView record={record} options={options} />
}
