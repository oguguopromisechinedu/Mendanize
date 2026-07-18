import type { Metadata } from "next"

import { requireUser } from "@/features/authentication/server"
import {
  RecommendedView,
  loadRecommended,
} from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Recommended for you",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  const items = await loadRecommended(session!.user.id)
  return <RecommendedView items={items} />
}
