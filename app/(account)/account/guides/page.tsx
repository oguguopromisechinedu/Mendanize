import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { PublicGuideListView } from "@/features/learning-guides"
import { listGuides } from "@/services/content"

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mendanize.com"

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Structured learning paths — educational journeys with sections and lessons.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/guides` },
}

export default async function GuidesPage() {
  const guides = await listGuides({ pageSize: 50 })

  return (
    <PageShell
      title="Guides"
      hideHeader
      width="wide"
      homeHref="/account"
      homeLabel="Account"
      crumbs={[{ label: "Guides" }]}
    >
      <PublicGuideListView guides={guides} scope="account" />
    </PageShell>
  )
}
