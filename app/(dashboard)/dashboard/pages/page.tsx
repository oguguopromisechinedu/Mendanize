import type { Metadata } from "next"

import { PagesListView, loadPages } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Pages",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const status =
    raw.status === "DRAFT" ||
    raw.status === "REVIEW" ||
    raw.status === "PUBLISHED" ||
    raw.status === "ARCHIVED"
      ? raw.status
      : undefined
  const initial = await loadPages({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status,
  })
  return <PagesListView initial={initial} />
}
