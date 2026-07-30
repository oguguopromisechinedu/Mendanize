import type { Metadata } from "next"

import { EmsNewsletterView } from "@/features/email-management"
import { loadNewsletter } from "@/features/admin-modules/server"

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
  return <EmsNewsletterView initial={initial} />
}
