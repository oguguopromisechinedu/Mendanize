import type { Metadata } from "next"

import { SubscribersListView, loadSubscribers } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Subscribers",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadSubscribers({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  })
  return <SubscribersListView initial={initial} />
}
