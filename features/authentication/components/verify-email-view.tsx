"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { routes } from "@/lib/design"
import {
  resendVerificationEmail,
} from "../actions/actions"
import { AuthShell } from "./auth-shell"

type Props = {
  email?: string
  token?: string
  result?: { ok: boolean; message: string } | null
}

export function VerifyEmailView({ email, token, result }: Props) {
  const [resendEmail, setResendEmail] = useState(email ?? "")
  const [pending, setPending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function onResend(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setResendMessage(null)
    try {
      const res = await resendVerificationEmail({ email: resendEmail })
      setResendMessage(res.message ?? (res.ok ? "Sent." : "Unable to resend."))
    } finally {
      setPending(false)
    }
  }

  if (result?.ok) {
    return (
      <AuthShell
        title="Email verified"
        description={result.message}
        footer={
          <Link href={routes.signIn} className="text-primary hover:opacity-90">
            Continue to sign in
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link href={routes.signIn}>Sign in</Link>
        </Button>
      </AuthShell>
    )
  }

  if (token && email && result && !result.ok) {
    return (
      <AuthShell
        title="Verification failed"
        description={result.message}
        footer={
          <Link href={routes.signIn} className="text-primary hover:opacity-90">
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={onResend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />
          </div>
          {resendMessage ? (
            <p className="text-sm text-muted-foreground">{resendMessage}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Resend verification email"}
          </Button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Verify your email"
      description="We sent a verification link when you signed up. Open it from your inbox, or request a new one below."
      footer={
        <Link href={routes.signIn} className="text-primary hover:opacity-90">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onResend} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {resendMessage ? (
          <p className="text-sm text-muted-foreground">{resendMessage}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Resend verification email"}
        </Button>
      </form>
    </AuthShell>
  )
}
