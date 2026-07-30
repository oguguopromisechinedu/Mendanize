import type { Metadata } from "next"

import { DisputesAdminView } from "@/features/disputes"
import { listDisputesAdmin } from "@/services/disputes"

export const metadata: Metadata = {
  title: "Marketplace disputes",
  robots: { index: false },
}

export default async function Page() {
  const disputes = await listDisputesAdmin()
  return <DisputesAdminView disputes={disputes} />
}
