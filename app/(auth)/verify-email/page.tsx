import type { Metadata } from "next"

import { VerifyEmailView } from "@/features/authentication/components/verify-email-view"
import { verifyEmailWithToken } from "@/features/authentication/actions/actions"

export const metadata: Metadata = {
  title: "Verify email",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const email = typeof raw.email === "string" ? raw.email : undefined
  const token = typeof raw.token === "string" ? raw.token : undefined

  let result: { ok: boolean; message: string } | null = null
  if (email && token) {
    const actionResult = await verifyEmailWithToken({ email, token })
    result = {
      ok: actionResult.ok,
      message: actionResult.message ?? (actionResult.ok ? "Verified." : "Failed."),
    }
  }

  return <VerifyEmailView email={email} token={token} result={result} />
}
