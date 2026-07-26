import Link from "next/link"

import type { DashboardHomeData } from "../types/types"
import { AdminPanel } from "./admin-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"

function WorkflowStepper({ steps }: { steps: DashboardHomeData["workflow"] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step.id} className="flex gap-3">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              step.status === "done" && "bg-primary text-primary-foreground",
              step.status === "current" &&
                "border-2 border-primary bg-primary/15 text-primary",
              step.status === "upcoming" &&
                "border border-border bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "upcoming"
                  ? "text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {step.label}
            </p>
            {step.status === "current" ? (
              <p className="text-xs text-primary">In progress</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DashboardRightRail({ data }: { data: DashboardHomeData }) {
  return (
    <aside className="hidden w-[19rem] shrink-0 space-y-4 xl:block">
      <AdminPanel
        title="Publishing Workflow"
        description="Live queue from drafts → publish"
        action={
          <Link
            href="/dashboard/workflow"
            className="text-xs font-medium text-primary hover:underline"
          >
            Open queue
          </Link>
        }
      >
        <WorkflowStepper steps={data.workflow} />
      </AdminPanel>

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
    </aside>
  )
}
