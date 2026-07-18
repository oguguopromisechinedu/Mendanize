import type { Metadata } from "next"

import { requireUser } from "@/features/authentication/server"
import {
  InterestsView,
  loadInterestsPage,
} from "@/features/user-learning"

export const metadata: Metadata = {
  title: "My interests",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireUser()
  const data = await loadInterestsPage(session!.user.id)
  return (
    <InterestsView interests={data.interests} taxonomy={data.taxonomy} />
  )
}
