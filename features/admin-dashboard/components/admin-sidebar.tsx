"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ComponentType } from "react"
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  CornerDownRight,
  Cpu,
  CreditCard,
  ExternalLink,
  FilePen,
  FileText,
  Folder,
  FolderKanban,
  Hash,
  ImageIcon,
  Landmark,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  LineChart,
  Mail,
  Map,
  Menu,
  MessageSquare,
  MessageSquareText,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Store,
  Tags,
  Trash2,
  TrendingUp,
  Unlink,
  Users,
  Video,
  Zap,
  GitBranch,
  Home,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AdminShellSession } from "../types/shell"
import type { AdminNavigationConfig } from "@/services/settings/admin-navigation"

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  sparkles: Sparkles,
  "file-text": FileText,
  "file-pen": FilePen,
  folder: Folder,
  "folder-kanban": FolderKanban,
  tags: Tags,
  "book-open": BookOpen,
  menu: Menu,
  image: ImageIcon,
  layout: LayoutTemplate,
  "message-square": MessageSquare,
  "message-square-text": MessageSquareText,
  hash: Hash,
  search: Search,
  "text-search": Search,
  home: Home,
  "corner-down-right": CornerDownRight,
  map: Map,
  unlink: Unlink,
  mail: Mail,
  bell: Bell,
  users: Users,
  "bar-chart-3": BarChart3,
  "line-chart": LineChart,
  landmark: Landmark,
  "trending-up": TrendingUp,
  shield: Shield,
  "git-branch": GitBranch,
  activity: Activity,
  cpu: Cpu,
  zap: Zap,
  library: Library,
  settings: Settings,
  "credit-card": CreditCard,
  video: Video,
  calendar: Calendar,
  trash: Trash2,
  award: Award,
  star: Star,
  "code-2": Code2,
  store: Store,
}

export function AdminSidebar({
  config,
  collapsed,
  onToggle,
  session,
}: {
  config: AdminNavigationConfig
  collapsed: boolean
  onToggle: () => void
  session?: AdminShellSession
}) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.groups.map((g) => [g.id, true]))
  )

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface transition-[width] duration-[var(--motion-base)]",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-3">
        {!collapsed ? (
          <Link
            href={config.brand.href}
            className="inline-flex items-center gap-2.5 truncate font-display text-base font-bold text-foreground"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            {config.brand.name}
          </Link>
        ) : (
          <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden lg:inline-flex"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin">
        {config.groups.map((group) => {
          const open = openGroups[group.id] ?? true
          return (
            <div key={group.id} className="mb-3">
              {!collapsed ? (
                <button
                  type="button"
                  className="mb-1 flex w-full items-center justify-between px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.id]: !open }))
                  }
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      open ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
              ) : null}
              {(collapsed || open) && (
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon] ?? LayoutDashboard
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(`${item.href}/`))
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={item.label}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/15 text-foreground"
                              : "text-muted-foreground hover:bg-hover hover:text-foreground",
                            collapsed && "justify-center px-2"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="size-4 shrink-0" />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      {!collapsed && session ? (
        <div className="border-t border-border p-3 space-y-3">
          <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
            <p className="text-xs font-medium text-emerald-500">Your site is live</p>
            <Link
              href="/"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              mendanize.com
              <ExternalLink className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {(session.user.name ?? session.user.email).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {session.user.role?.toLowerCase().replace("_", " ") ?? "Editor"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
