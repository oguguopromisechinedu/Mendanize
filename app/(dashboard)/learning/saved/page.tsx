import type { Metadata } from "next"

import { requireUser } from "@/features/authentication/server"
import { SavedContentView, loadSaved } from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Saved content",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  const items = await loadSaved(session!.user.id)
  return <SavedContentView items={items} />
}
