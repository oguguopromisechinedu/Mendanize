import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import {
  ContinueLearningView,
  loadContinueLearning,
} from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Continue learning",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const cards = await loadContinueLearning(session!.user.id)
  return <ContinueLearningView cards={cards} />
}
