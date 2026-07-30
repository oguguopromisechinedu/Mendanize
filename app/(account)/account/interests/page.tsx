import { loadInterestsPage } from "@/features/user-learning/server";
import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import {
  InterestsView } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "My interests",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const data = await loadInterestsPage(session!.user.id)
  return (
    <InterestsView interests={data.interests} taxonomy={data.taxonomy} />
  )
}
