import type { Metadata } from "next"

import { BrokenLinksView } from "@/features/admin-modules"
import { loadBrokenLinks } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Broken Links",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const status =
    raw.status === "OPEN" || raw.status === "IGNORED" || raw.status === "FIXED"
      ? raw.status
      : undefined
  const initial = await loadBrokenLinks({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status,
  })
  return <BrokenLinksView initial={initial} />
}
