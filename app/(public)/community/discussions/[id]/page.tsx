import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { DiscussionDetailView } from "@/features/community"
import { getDiscussion, isCommunityModerator } from "@/services/community"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const discussion = await getDiscussion(id)
  if (!discussion) return { title: "Discussion" }
  return { title: discussion.title }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const discussion = await getDiscussion(id)
  if (!discussion) notFound()
  const session = await getPublicSession()
  const isModerator = session?.user?.id
    ? await isCommunityModerator(session.user.id)
    : false

  return (
    <PageShell
      title={discussion.title}
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Discussions", href: "/community/discussions" },
        { label: discussion.title },
      ]}
    >
      <DiscussionDetailView
        discussion={discussion}
        signedIn={Boolean(session?.user?.id)}
        isModerator={isModerator}
      />
    </PageShell>
  )
}
