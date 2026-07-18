import type { Metadata } from "next"

import { NewsletterListView, loadNewsletter } from "@/features/admin-modules"

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadNewsletter({
    query: typeof raw.query === "string" ? raw.query : undefined,
  })
  return <NewsletterListView initial={initial} />
}
