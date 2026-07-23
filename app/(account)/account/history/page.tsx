import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import { HistoryView, loadHistory } from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Learning history",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const items = await loadHistory(session!.user.id)
  return <HistoryView items={items} />
}
