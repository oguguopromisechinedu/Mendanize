import Link from "next/link"

import type { DashboardHomeData } from "../types/types"
import { AdminPanel } from "./admin-primitives"
import { StatusBadge } from "./status-badge"

export function DashboardRightRail({ data }: { data: DashboardHomeData }) {
  return (
    <aside className="hidden w-[19rem] shrink-0 space-y-4 xl:block">
      <AdminPanel
        title="AI & API Status"
        action={
          <Link
            href="/dashboard/integrations"
            className="text-xs font-medium text-primary hover:underline"
          >
            Manage
          </Link>
        }
      >
        {data.aiStatus.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Provider status will appear when integrations are configured.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.aiStatus.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.detail}
                  </p>
                </div>
                <StatusBadge
                  status={p.connected ? "connected" : "disconnected"}
                />
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel title="System Overview">
        <ul className="space-y-3">
          {data.system.map((m) => (
            <li key={m.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-medium text-foreground">{m.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{
                    width: m.value.endsWith("%") ? m.value : "8%",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{m.detail}</p>
            </li>
          ))}
        </ul>
      </AdminPanel>

      <AdminPanel
        title="Publishing workspace"
        description="Content tools moved to Post"
        action={
          <Link
            href="/dashboard/post"
            className="text-xs font-medium text-primary hover:underline"
          >
            Open Post
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Articles, guides, media, pages, drafts, scheduled posts, and AI
          generators are managed under the Post section.
        </p>
      </AdminPanel>
    </aside>
  )
}
