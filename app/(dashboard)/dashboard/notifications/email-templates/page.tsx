import { loadEmailTemplates } from "@/features/notifications/server";
import type { Metadata } from "next"

import { EmailTemplatesView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Email templates",
  robots: { index: false },
}

export default async function Page() {
  const templates = await loadEmailTemplates()
  return <EmailTemplatesView templates={templates} />
}
