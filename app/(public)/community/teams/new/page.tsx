import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { NewTeamForm } from "@/features/community"

export const metadata: Metadata = {
  title: "Create team",
  robots: { index: false },
}

export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/teams/new")
  }
  return (
    <PageShell
      title="Create team"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Teams", href: "/community/teams" },
        { label: "New" },
      ]}
    >
      <NewTeamForm />
    </PageShell>
  )
}
