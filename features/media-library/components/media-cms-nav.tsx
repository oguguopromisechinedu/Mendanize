"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { MEDIA_NAV } from "../constants/constants"

export function MediaCmsNav() {
  const pathname = usePathname()
  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Media library">
      {MEDIA_NAV.map((item) => {
        const active =
          item.href === "/dashboard/media"
            ? pathname === item.href
            : pathname.startsWith(item.href)
        return (
          <Button
            key={item.href}
            asChild
            size="sm"
            variant={active ? "secondary" : "outline"}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        )
      })}
    </nav>
  )
}
