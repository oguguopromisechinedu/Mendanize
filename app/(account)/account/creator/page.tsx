import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { ensureCreatorFlag } from "@/services/marketplace"

export const metadata = {
  title: "Creator onboarding",
  robots: { index: false },
}

/**
 * Entry point for “Become a creator”.
 * Enables CreatorFlag then opens the creator dashboard.
 */
export default async function CreatorOnboardingPage() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/creator")}`)
  }

  try {
    const flag = await ensureCreatorFlag(session.user.id)
    if (!flag) {
      redirect("/account/marketplace?error=creator-setup")
    }
  } catch (error) {
    console.error("[account/creator] creator flag", error)
    redirect("/account/marketplace?error=creator-setup")
  }

  redirect("/account/marketplace?onboarded=1")
}
