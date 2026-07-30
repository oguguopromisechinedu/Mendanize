import type { Metadata } from "next"

import { SignUpForm } from "@/features/authentication/components/sign-up-form"

export const metadata: Metadata = {
  title: "Join Creators Hub",
}

export default function SignUpPage() {
  return <SignUpForm />
}
