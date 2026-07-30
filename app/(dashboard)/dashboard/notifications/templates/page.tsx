import { loadTemplates } from "@/features/notifications/server";
import type { Metadata } from "next"

import { NotificationTemplatesView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notification templates",
  robots: { index: false },
}

export default async function Page() {
  const templates = await loadTemplates()
  return <NotificationTemplatesView templates={templates} />
}
