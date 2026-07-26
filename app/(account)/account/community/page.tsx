import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getPublicSession } from "@/features/authentication/server"

export const metadata: Metadata = {
  title: "Community",
  robots: { index: false },
}

/** Learner account entry → public Community profile (MES-036). */
export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/profile")
  }
  redirect("/community/profile")
}
