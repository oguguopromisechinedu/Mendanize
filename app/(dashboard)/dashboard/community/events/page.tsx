import type { Metadata } from "next"

import { EventsAdminView } from "@/features/community-events"
import { listEventsAdmin } from "@/services/community-events"

export const metadata: Metadata = {
  title: "Community events",
  robots: { index: false },
}

export default async function Page() {
  const events = await listEventsAdmin()
  return <EventsAdminView events={events} />
}
