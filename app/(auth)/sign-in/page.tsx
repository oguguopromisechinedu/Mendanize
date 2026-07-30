import type { Metadata } from "next"

import { SignInPageClient } from "@/features/authentication/components/sign-in-form"

export const metadata: Metadata = {
  title: "Creators Hub — Sign in",
}

export default function SignInPage() {
  return <SignInPageClient />
}
