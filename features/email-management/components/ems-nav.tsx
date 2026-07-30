"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/dashboard/communication/email/templates", label: "Templates" },
  { href: "/dashboard/communication/email/categories", label: "Categories" },
  { href: "/dashboard/communication/email/senders", label: "Senders" },
  { href: "/dashboard/communication/email/variables", label: "Variables" },
  { href: "/dashboard/communication/email/newsletter", label: "Newsletter" },
  { href: "/dashboard/communication/email/automations", label: "Automations" },
  { href: "/dashboard/communication/email/analytics", label: "Analytics" },
  { href: "/dashboard/communication/email/queue", label: "Queue" },
  { href: "/dashboard/communication/email/settings", label: "Settings" },
] as const

export function EmsNav() {
  const pathname = usePathname()
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-border pb-2">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
