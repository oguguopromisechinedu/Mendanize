import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { TeamListView } from "@/features/community"
import { listTeams } from "@/services/community"

export const metadata: Metadata = {
  title: "Teams",
  description: "Team projects on Mendanize Community.",
}

export default async function Page() {
  const [session, { items }] = await Promise.all([
    getPublicSession(),
    listTeams(),
  ])
  return (
    <PageShell
      title="Teams"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Teams" },
      ]}
    >
      <TeamListView items={items} signedIn={Boolean(session?.user?.id)} />
    </PageShell>
  )
}
