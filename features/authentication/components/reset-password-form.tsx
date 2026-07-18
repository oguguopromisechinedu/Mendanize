"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { routes } from "@/lib/design"
import { resetPassword } from "../actions/actions"
import { AuthShell } from "./auth-shell"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [token, setToken] = useState(searchParams.get("token") ?? "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const result = await resetPassword({
      email,
      token,
      password,
      confirmPassword,
    })
    setLoading(false)

    if (!result.ok) {
      setError(result.message)
      setFieldErrors(result.fieldErrors ?? {})
      return
    }

    setSuccess(result.message ?? "Password updated.")
  }

  return (
    <AuthShell
      title="Reset password"
      description="Choose a new password for your account"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Reset token</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {fieldErrors.token?.[0] ? (
            <p className="text-xs text-destructive">{fieldErrors.token[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password?.[0] ? (
            <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {fieldErrors.confirmPassword?.[0] ? (
            <p className="text-xs text-destructive">
              {fieldErrors.confirmPassword[0]}
            </p>
          ) : null}
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
          Update password
        </Button>
      </form>
    </AuthShell>
  )
}
