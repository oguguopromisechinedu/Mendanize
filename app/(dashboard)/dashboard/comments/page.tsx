import type { Metadata } from "next"

import { CommentsListView } from "@/features/admin-modules"
import { loadComments } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Comments",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const status =
    raw.status === "PENDING" ||
    raw.status === "APPROVED" ||
    raw.status === "REJECTED" ||
    raw.status === "SPAM"
      ? raw.status
      : undefined
  const initial = await loadComments({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status,
  })
  return <CommentsListView initial={initial} />
}
