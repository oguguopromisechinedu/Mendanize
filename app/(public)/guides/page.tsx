import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicGuideListView } from "@/features/learning-guides"
import { listGuides } from "@/services/content"

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Structured learning paths — educational journeys with sections and lessons.",
}

export default async function GuidesPage() {
  const guides = await listGuides({ pageSize: 50 })

  return (
    <PageShell
      title="Guides"
      hideHeader
      width="wide"
      crumbs={[{ label: "Guides" }]}
    >
      <PublicGuideListView guides={guides} />
    </PageShell>
  )
}
