import type { Metadata } from "next"

import { ActivityLogView } from "@/features/admin-modules"
import { loadActivityLog } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Activity Log",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadActivityLog({
    query: typeof raw.query === "string" ? raw.query : undefined,
    entityType: typeof raw.entityType === "string" ? raw.entityType : undefined,
  })
  return <ActivityLogView initial={initial} />
}
