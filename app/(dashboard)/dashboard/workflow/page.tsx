import type { Metadata } from "next"

import { WorkflowQueueView } from "@/features/admin-modules"
import { loadWorkflow } from "@/features/admin-modules/server"

export const metadata: Metadata = {
  title: "Workflow",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const kind =
    raw.kind === "article" || raw.kind === "guide" || raw.kind === "tool"
      ? raw.kind
      : undefined
  const initial = await loadWorkflow({
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    kind,
  })
  return <WorkflowQueueView initial={initial} />
}
