"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { acceptStaffInviteAction } from "../actions/actions"

export function AcceptInviteView({
  token,
  email,
  defaultName,
  roleLabel,
}: {
  token: string
  email: string
  defaultName: string | null
  roleLabel: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState(defaultName ?? "")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Join Mendanize staff</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You were invited as <strong>{roleLabel}</strong> for{" "}
        <strong>{email}</strong>. Set your password to activate dashboard
        access.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (password !== confirm) {
            toast.error("Passwords do not match")
            return
          }
          start(async () => {
            const res = await acceptStaffInviteAction({
              token,
              password,
              name: name.trim() || null,
            })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              router.push("/dashboard/login")
            }
          })
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="h-10 rounded-lg border border-input bg-background px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
            className="h-10 rounded-lg border border-input bg-background px-3"
          />
        </label>
        <Button type="submit" className="w-full rounded-xl" disabled={pending}>
          Activate account
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/dashboard/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
