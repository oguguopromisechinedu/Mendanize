import type { Metadata } from "next"
import { Suspense } from "react"

import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
