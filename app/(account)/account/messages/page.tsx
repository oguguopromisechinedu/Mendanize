import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { MessagesInboxView } from "@/features/messaging"
import { listThreadsForUser } from "@/services/messaging"

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/messages")}`)
  }

  const raw = await searchParams
  const withUserId =
    typeof raw.userId === "string"
      ? raw.userId
      : typeof raw.with === "string"
        ? raw.with
        : null

  const threads = await listThreadsForUser(session.user.id)

  return <MessagesInboxView threads={threads} withUserId={withUserId} />
}
