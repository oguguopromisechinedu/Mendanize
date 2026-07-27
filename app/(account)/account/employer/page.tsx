import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { ensureClientFlag } from "@/services/marketplace"
import { getOrganizationForUser } from "@/services/organization"

export const metadata = {
  title: "Employer onboarding",
  robots: { index: false },
}

/**
 * Entry point for “Enable client posting”.
 * No org → company registration. Existing org → employer (hiring) dashboard.
 */
export default async function EmployerOnboardingPage() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/employer")}`)
  }

  const org = await getOrganizationForUser(session.user.id)
  if (!org) {
    redirect("/account/company?intent=employer")
  }

  try {
    await ensureClientFlag(session.user.id)
  } catch (error) {
    console.error("[account/employer] client flag", error)
    redirect("/account/hiring?error=client-setup")
  }

  redirect("/account/hiring?onboarded=1")
}
