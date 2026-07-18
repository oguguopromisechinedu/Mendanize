"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

import { signOutAction } from "@/features/authentication"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function SignOutMenuItem() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenuItem
      disabled={pending}
      onSelect={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await signOutAction()
          router.push("/sign-in")
          router.refresh()
        })
      }}
    >
      Sign out
    </DropdownMenuItem>
  )
}

/** Derive breadcrumb trail from pathname + known admin labels. */
export function useAdminCrumbs(
  labelByHref: Record<string, string>
): Array<{ label: string; href?: string }> {
  const pathname = usePathname()
  if (!pathname || pathname === "/dashboard") return []

  const parts = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean)
  const crumbs: Array<{ label: string; href?: string }> = []
  let acc = "/dashboard"

  for (let i = 0; i < parts.length; i++) {
    acc += `/${parts[i]}`
    const last = i === parts.length - 1
    const label =
      labelByHref[acc] ??
      parts[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    crumbs.push(last ? { label } : { label, href: acc })
  }

  return crumbs
}
