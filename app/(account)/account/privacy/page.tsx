import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import { PrivacyControls } from "@/features/privacy/components/privacy-controls"
import { Container } from "@/components/ui/container"

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false },
}

export default async function AccountPrivacyPage() {
  await requirePublicUser()
  return (
    <Container size="lg" className="py-10">
      <h1 className="type-h2 text-foreground">Privacy</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Export or delete your learner account data (MES-035).
      </p>
      <PrivacyControls />
    </Container>
  )
}
