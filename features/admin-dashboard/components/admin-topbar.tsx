"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/components/ui/ThemeToggle"
import type { AdminShellSession } from "../types/shell"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SignOutMenuItem, useAdminCrumbs } from "./admin-crumbs"
import { AdminAiCommandBar } from "./admin-ai-command-bar"
import { AdminQuickCreateMenu } from "./admin-quick-create-menu"

export function AdminTopBar({
  session,
  labelByHref,
  onOpenMobileNav,
}: {
  session: AdminShellSession
  labelByHref: Record<string, string>
  onOpenMobileNav: () => void
}) {
  const pathname = usePathname()
  const crumbs = useAdminCrumbs(labelByHref)
  const isDashboardHome = pathname === "/dashboard"

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        {!isDashboardHome ? (
          <Breadcrumb className="hidden min-w-0 flex-1 md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1
                return (
                  <span key={`${crumb.label}-${i}`} className="contents">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {last || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="text-sm font-semibold text-foreground">Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Overview of your AI-powered publishing platform
            </p>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <AdminQuickCreateMenu />
          <Button asChild variant="ghost" size="icon" aria-label="Notifications">
            <Link href="/dashboard/notifications/center">
              <Bell className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {(session.user.name ?? session.user.email)
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <span className="hidden max-w-[8rem] truncate sm:inline">
                  {session.user.name ?? session.user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session.user.name ?? "Admin"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {session.user.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">View site</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOutMenuItem />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 pb-3 pt-3 lg:px-6">
        <AdminAiCommandBar />
      </div>
    </header>
  )
}
