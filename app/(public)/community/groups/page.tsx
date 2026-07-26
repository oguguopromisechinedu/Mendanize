import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { StudyGroupListView } from "@/features/community"
import { listStudyGroups } from "@/services/community"

export const metadata: Metadata = {
  title: "Study groups",
  description: "Join or create study groups on Mendanize Community.",
}

export default async function Page() {
  const [session, { items }] = await Promise.all([
    getPublicSession(),
    listStudyGroups(),
  ])
  return (
    <PageShell
      title="Study groups"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Study groups" },
      ]}
    >
      <StudyGroupListView
        items={items}
        signedIn={Boolean(session?.user?.id)}
      />
    </PageShell>
  )
}
