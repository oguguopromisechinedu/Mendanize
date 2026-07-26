import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { CommunitySearchView } from "@/features/community"
import { searchCommunity } from "@/services/community"

export const metadata: Metadata = {
  title: "Community search",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const query = typeof raw.q === "string" ? raw.q : ""
  const hits = query ? await searchCommunity(query) : []

  return (
    <PageShell
      title="Community search"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Search" },
      ]}
    >
      <CommunitySearchView query={query} hits={hits} />
    </PageShell>
  )
}
