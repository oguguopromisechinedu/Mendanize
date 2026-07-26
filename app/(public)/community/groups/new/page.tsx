import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { NewStudyGroupForm } from "@/features/community"

export const metadata: Metadata = {
  title: "Create study group",
  robots: { index: false },
}

export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/groups/new")
  }
  return (
    <PageShell
      title="Create study group"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Study groups", href: "/community/groups" },
        { label: "New" },
      ]}
    >
      <NewStudyGroupForm />
    </PageShell>
  )
}
