import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { ThreadView } from "@/features/messaging"
import { getThreadMessages } from "@/services/messaging"

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/messages")}`)
  }

  const { threadId } = await params
  let data
  try {
    data = await getThreadMessages(threadId, session.user.id)
  } catch {
    notFound()
  }
  return <ThreadView thread={data.thread} messages={data.messages} />
}
