import type { Metadata } from "next"

import { SeoRobotsView } from "@/features/seo"
import { loadRobots } from "@/features/seo/server"

export const metadata: Metadata = {
  title: "Robots.txt",
  robots: { index: false },
}

export default async function Page() {
  const { rules, preview } = await loadRobots()
  return <SeoRobotsView rules={rules} preview={preview} />
}
