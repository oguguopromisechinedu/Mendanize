import type { Metadata } from "next"

import { requireUser } from "@/features/authentication/server"
import {
  ContinueLearningView,
  loadContinueLearning,
} from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Continue learning",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  const cards = await loadContinueLearning(session!.user.id)
  return <ContinueLearningView cards={cards} />
}
