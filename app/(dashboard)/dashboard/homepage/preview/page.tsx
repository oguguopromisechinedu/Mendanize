import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepagePreviewView } from "@/features/homepage-management";
import { getHomepageContent } from "@/services/content/homepage"

export const metadata: Metadata = {
  title: "Homepage preview",
  robots: { index: false },
}

export default async function Page() {
  const [record, content] = await Promise.all([
    loadHomepageAdmin(),
    getHomepageContent({ preview: true }),
  ])
  return <HomepagePreviewView content={content} status={record.status} />
}
