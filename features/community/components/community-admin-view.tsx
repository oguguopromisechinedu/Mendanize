"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AdminPageHeader,
  AdminActionToolbar,
} from "@/features/admin-dashboard"
import type {
  CommunityCategoryRecord,
  CommunityModeratorRecord,
  CommunityReportRecord,
  ShowcaseProjectSummary,
} from "@/services/community"
import {
  featureProjectAction,
  grantModeratorAction,
  resolveReportAction,
  revokeModeratorAction,
  upsertCategoryAction,
} from "../actions/actions"

export function CommunityAdminView({
  reports,
  moderators,
  categories,
  featuredProjects,
}: {
  reports: CommunityReportRecord[]
  moderators: CommunityModeratorRecord[]
  categories: CommunityCategoryRecord[]
  featuredProjects: ShowcaseProjectSummary[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [modUserId, setModUserId] = useState("")
  const [catName, setCatName] = useState("")

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <AdminPageHeader
        title="Community"
        description="Moderation queue, categories, featured projects, and community moderator flags. Community moderators never receive /dashboard access."
      />

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Reported content ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open reports.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {r.contentType} · {r.contentId}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reporter: {r.reporter.name ?? r.reporter.email}
                  </p>
                </div>
                <AdminActionToolbar>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await resolveReportAction({
                          reportId: r.id,
                          status: "RESOLVED",
                          hideContent: true,
                        })
                        if (!res.ok) toast.error(res.message)
                        else {
                          toast.success("Resolved & hidden")
                          router.refresh()
                        }
                      })
                    }
                  >
                    Hide & resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await resolveReportAction({
                          reportId: r.id,
                          status: "DISMISSED",
                        })
                        if (!res.ok) toast.error(res.message)
                        else {
                          toast.success("Dismissed")
                          router.refresh()
                        }
                      })
                    }
                  >
                    Dismiss
                  </Button>
                </AdminActionToolbar>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Community moderators
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Grants a PublicUser-scoped flag for /community only — never Admin RBAC
          or dashboard routes.
        </p>
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            start(async () => {
              const res = await grantModeratorAction({
                publicUserId: modUserId.trim(),
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success("Moderator granted")
                setModUserId("")
                router.refresh()
              }
            })
          }}
        >
          <input
            value={modUserId}
            onChange={(e) => setModUserId(e.target.value)}
            placeholder="PublicUser id"
            className="h-9 w-72 rounded-lg border border-input bg-transparent px-3 text-sm"
            required
          />
          <Button size="sm" type="submit" disabled={pending}>
            Grant flag
          </Button>
        </form>
        <ul className="space-y-2 text-sm">
          {moderators.map((m) => (
            <li
              key={m.publicUserId}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span>
                {m.name ?? m.email}{" "}
                <span className="text-xs text-muted-foreground">
                  ({m.publicUserId})
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await revokeModeratorAction(m.publicUserId)
                    if (!res.ok) toast.error(res.message)
                    else {
                      toast.success("Revoked")
                      router.refresh()
                    }
                  })
                }
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Category management
        </h2>
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            start(async () => {
              const res = await upsertCategoryAction({ name: catName })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success("Category saved")
                setCatName("")
                router.refresh()
              }
            })
          }}
        >
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="New category name"
            className="h-9 w-72 rounded-lg border border-input bg-transparent px-3 text-sm"
            required
          />
          <Button size="sm" type="submit" disabled={pending}>
            Add category
          </Button>
        </form>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {categories.map((c) => (
            <li key={c.id}>
              {c.name}{" "}
              <span className="text-xs">(/{c.slug})</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Featured projects
        </h2>
        {featuredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No featured projects. Feature from project records once published.
          </p>
        ) : (
          <ul className="space-y-2">
            {featuredProjects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{p.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await featureProjectAction({
                        projectId: p.id,
                        featured: false,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success("Unfeatured")
                        router.refresh()
                      }
                    })
                  }
                >
                  Unfeature
                </Button>
              </li>
            ))}
          </ul>
        )}
        <FeatureById pending={pending} onDone={() => router.refresh()} />
      </section>
    </div>
  )
}

function FeatureById({
  pending,
  onDone,
}: {
  pending: boolean
  onDone: () => void
}) {
  const [projectId, setProjectId] = useState("")
  const [start, isPending] = useTransitionPair(pending)

  return (
    <form
      className="mt-4 flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const res = await featureProjectAction({
            projectId: projectId.trim(),
            featured: true,
          })
          if (!res.ok) toast.error(res.message)
          else {
            toast.success("Featured")
            setProjectId("")
            onDone()
          }
        })
      }}
    >
      <input
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        placeholder="Project id to feature"
        className="h-9 w-72 rounded-lg border border-input bg-transparent px-3 text-sm"
        required
      />
      <Button size="sm" type="submit" disabled={isPending}>
        Feature project
      </Button>
    </form>
  )
}

function useTransitionPair(externalPending: boolean) {
  const [pending, start] = useTransition()
  return [start, pending || externalPending] as const
}
