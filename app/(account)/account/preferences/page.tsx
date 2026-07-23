import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import {
  PreferencesView,
  loadPreferencesPage,
} from "@/features/user-learning"

export const metadata: Metadata = {
  title: "Account preferences",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const data = await loadPreferencesPage(session!.user.id)
  return (
    <PreferencesView
      preferences={data.preferences}
      goals={data.goals}
      taxonomy={data.taxonomy}
    />
  )
}
