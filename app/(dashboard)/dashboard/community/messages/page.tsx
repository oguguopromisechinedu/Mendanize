import type { Metadata } from "next"

import { MessageReportsAdminView } from "@/features/messaging"
import { listOpenMessageReports } from "@/services/messaging"

export const metadata: Metadata = {
  title: "Message reports",
  robots: { index: false },
}

export default async function Page() {
  const reports = await listOpenMessageReports()
  return <MessageReportsAdminView reports={reports} />
}
