import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { CommunityHomeView } from "@/features/community"
import { getCommunityHome } from "@/services/community"

export const metadata: Metadata = {
  title: "Community",
  description:
    "Discuss, form study groups and teams, and showcase learner projects on Mendanize.",
}

export default async function Page() {
  const [data, session] = await Promise.all([
    getCommunityHome(),
    getPublicSession(),
  ])
  return (
    <PageShell title="Community" hideHeader crumbs={[{ label: "Community" }]}>
      <CommunityHomeView data={data} signedIn={Boolean(session?.user?.id)} />
    </PageShell>
  )
}
