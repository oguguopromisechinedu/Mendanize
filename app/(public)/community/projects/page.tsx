import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { ProjectListView } from "@/features/community"
import { listShowcaseProjects } from "@/services/community"

export const metadata: Metadata = {
  title: "Project showcase",
  description: "Learner project showcase on Mendanize Community.",
}

export default async function Page() {
  const [session, { items }] = await Promise.all([
    getPublicSession(),
    listShowcaseProjects(),
  ])
  return (
    <PageShell
      title="Project showcase"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Showcase" },
      ]}
    >
      <ProjectListView items={items} signedIn={Boolean(session?.user?.id)} />
    </PageShell>
  )
}
