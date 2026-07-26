import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { CommunityProfileView } from "@/features/community"
import { getCommunityProfile } from "@/services/community"

export const metadata: Metadata = {
  title: "Community profile",
  robots: { index: false },
}

export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/profile")
  }
  const profile = await getCommunityProfile(session.user.id)
  if (!profile) redirect("/sign-in")

  return (
    <PageShell
      title="Community profile"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Profile" },
      ]}
    >
      <CommunityProfileView profile={profile} editable />
    </PageShell>
  )
}
