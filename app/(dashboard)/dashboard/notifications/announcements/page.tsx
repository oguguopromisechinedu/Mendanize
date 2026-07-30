import { loadAnnouncements } from "@/features/notifications/server";
import type { Metadata } from "next"

import { AnnouncementsView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false },
}

export default async function Page() {
  const announcements = await loadAnnouncements()
  return <AnnouncementsView announcements={announcements} />
}
