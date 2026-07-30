import { loadHistory } from "@/features/notifications/server";
import type { Metadata } from "next"

import { CommunicationHistoryView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Communication history",
  robots: { index: false },
}

export default async function Page() {
  const data = await loadHistory()
  return <CommunicationHistoryView items={data.items} total={data.total} />
}
