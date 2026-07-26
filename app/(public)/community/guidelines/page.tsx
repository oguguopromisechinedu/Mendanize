import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { CommunityGuidelinesView } from "@/features/community"

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "Rules for participating in the Mendanize learning community.",
}

export default function Page() {
  return (
    <PageShell
      title="Community guidelines"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Guidelines" },
      ]}
    >
      <CommunityGuidelinesView />
    </PageShell>
  )
}
