import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { EventsListView } from "@/features/community-events"
import { listPublishedEvents } from "@/services/community-events"

export const metadata: Metadata = {
  title: "Community events",
  description: "Upcoming learning workshops, AMAs, and challenge kickoffs.",
}

export default async function Page() {
  const events = await listPublishedEvents()
  return (
    <PageShell
      title="Events"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Events" },
      ]}
    >
      <EventsListView events={events} />
    </PageShell>
  )
}
