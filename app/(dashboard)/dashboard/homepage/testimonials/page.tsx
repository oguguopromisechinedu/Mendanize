import { loadHomepageAdmin } from "@/features/homepage-management/server";
import type { Metadata } from "next"

import { HomepageTestimonialsView } from "@/features/homepage-management";

export const metadata: Metadata = {
  title: "Homepage testimonials",
  robots: { index: false },
}

export default async function Page() {
  const record = await loadHomepageAdmin()
  return <HomepageTestimonialsView record={record} />
}
