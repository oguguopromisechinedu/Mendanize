import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { TeamDetailView } from "@/features/community"
import { getTeam } from "@/services/community"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const team = await getTeam(slug)
  return { title: team?.name ?? "Team" }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const team = await getTeam(slug)
  if (!team) notFound()
  const session = await getPublicSession()
  const membership = session?.user?.id
    ? team.members.find((m) => m.publicUserId === session.user.id)
    : undefined
  const canManageProgress =
    membership?.role === "OWNER" || membership?.role === "LEAD"

  return (
    <PageShell
      title={team.name}
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Teams", href: "/community/teams" },
        { label: team.name },
      ]}
    >
      <TeamDetailView
        team={team}
        signedIn={Boolean(session?.user?.id)}
        canManageProgress={Boolean(canManageProgress)}
      />
    </PageShell>
  )
}
