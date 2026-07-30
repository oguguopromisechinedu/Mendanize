import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { EventDetailView } from "@/features/community-events"
import { getPublishedEventBySlug } from "@/services/community-events"

export const metadata: Metadata = {
  title: "Event",
  robots: { index: true },
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getPublicSession()
  const event = await getPublishedEventBySlug(slug, session?.user?.id)
  if (!event) notFound()

  return (
    <PageShell
      title={event.title}
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Events", href: "/community/events" },
        { label: event.title },
      ]}
    >
      <EventDetailView
        event={event}
        signedIn={Boolean(session?.user?.id)}
      />
    </PageShell>
  )
}
