import type { Metadata } from "next"

import { EmsVariablesView } from "@/features/email-management"
import { listEmsVariables } from "@/services/ems"

export const metadata: Metadata = {
  title: "Email variables",
  robots: { index: false },
}

export default async function Page() {
  const variables = await listEmsVariables()
  return <EmsVariablesView variables={variables} />
}
