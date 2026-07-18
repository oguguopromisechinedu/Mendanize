import type { Metadata } from "next"

import { UsersListView, loadUsers } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Users & Roles",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadUsers({
    query: typeof raw.query === "string" ? raw.query : undefined,
    role: typeof raw.role === "string" ? raw.role : undefined,
  })
  return <UsersListView initial={initial} />
}
