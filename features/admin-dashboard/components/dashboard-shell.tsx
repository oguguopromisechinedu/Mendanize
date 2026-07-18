"use client"

import { useMemo, useState, type ReactNode } from "react"

import type { AuthSession } from "@/features/authentication/types/types"
import type { AdminNavigationConfig } from "@/services/settings/admin-navigation"
import { AdminSidebar } from "./admin-sidebar"
import { AdminTopBar } from "./admin-topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function DashboardShell({
  session,
  nav,
  children,
}: {
  session: AuthSession
  nav: AdminNavigationConfig
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const labelByHref = useMemo(() => {
    const map: Record<string, string> = {}
    for (const group of nav.groups) {
      for (const item of group.items) {
        map[item.href] = item.label
      }
    }
    return map
  }, [nav])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex">
        <AdminSidebar
          config={nav}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          session={session}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton>
          <AdminSidebar
            config={nav}
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            session={session}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-[var(--motion-base)]",
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
        )}
      >
        <AdminTopBar
          session={session}
          labelByHref={labelByHref}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  )
}
