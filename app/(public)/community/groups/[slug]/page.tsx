import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { StudyGroupDetailView } from "@/features/community"
import { getStudyGroup } from "@/services/community"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const group = await getStudyGroup(slug)
  return { title: group?.name ?? "Study group" }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const group = await getStudyGroup(slug)
  if (!group) notFound()
  const session = await getPublicSession()
  return (
    <PageShell
      title={group.name}
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Study groups", href: "/community/groups" },
        { label: group.name },
      ]}
    >
      <StudyGroupDetailView
        group={group}
        signedIn={Boolean(session?.user?.id)}
      />
    </PageShell>
  )
}
