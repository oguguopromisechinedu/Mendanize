"use client"

import Link from "next/link"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { routes } from "@/lib/design"
import { requestPasswordReset } from "../actions/actions"
import { AuthShell } from "./auth-shell"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const result = await requestPasswordReset({ email })
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setSuccess(result.message ?? "Check your email for reset instructions.")
  }

  return (
    <AuthShell
      title="Forgot password"
      description="We'll prepare a reset link for your account"
      footer={
        <Link href={routes.signIn} className="text-primary hover:opacity-90">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  )
}
