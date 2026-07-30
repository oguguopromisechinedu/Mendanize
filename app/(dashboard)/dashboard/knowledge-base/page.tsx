import type { Metadata } from "next"

import { KnowledgeListView } from "@/features/admin-modules"
import { loadKnowledge } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Knowledge Base",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const initial = await loadKnowledge({
    query: typeof raw.query === "string" ? raw.query : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
  })
  return <KnowledgeListView initial={initial} />
}
