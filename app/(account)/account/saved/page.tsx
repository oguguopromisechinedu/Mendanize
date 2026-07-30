import { loadSaved } from "@/features/user-learning/server";
import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import { SavedContentView } from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Saved content",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const items = await loadSaved(session!.user.id)
  return <SavedContentView items={items} />
}
