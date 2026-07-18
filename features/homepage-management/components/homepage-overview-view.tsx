"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import type { HomepageAdminRecord } from "@/services/content/types"
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { publishHomepageAction } from "../actions/actions"
import { HOMEPAGE_SECTION_LABELS } from "../constants/constants"
import { HomepageCmsNav } from "./homepage-cms-nav"

export function HomepageOverviewView({
  record,
}: {
  record: HomepageAdminRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function publish() {
    startTransition(async () => {
      const res = await publishHomepageAction()
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  const featuredSummary = {
    categories: record.featured.filter((f) => f.kind === "CATEGORY").length,
    articles: record.featured.filter((f) => f.kind === "ARTICLE").length,
    guides: record.featured.filter((f) => f.kind === "GUIDE").length,
    tools: record.featured.filter((f) => f.kind === "TOOL").length,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Homepage CMS"
        description="Manage every public homepage section without code changes."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/homepage/preview">Preview</Link>
            </Button>
            <Button size="sm" disabled={pending} onClick={publish}>
              Publish
            </Button>
          </div>
        }
      />
      <HomepageCmsNav />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Status" value={record.status} />
        <AdminStatCard
          label="Active sections"
          value={String(record.activeSectionCount)}
        />
        <AdminStatCard
          label="Hidden sections"
          value={String(record.hiddenSectionCount)}
        />
        <AdminStatCard
          label="Updated"
          value={new Date(record.updatedAt).toLocaleDateString()}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Status">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <StatusBadge status={record.status.toLowerCase()} />
            <span className="text-muted-foreground">
              {record.publishedAt
                ? `Last published ${new Date(record.publishedAt).toLocaleString()}`
                : "Not published yet — public site uses seed content"}
            </span>
          </div>
        </AdminPanel>

        <AdminPanel title="Featured content summary">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Categories: {featuredSummary.categories}</li>
            <li>Articles: {featuredSummary.articles}</li>
            <li>Guides: {featuredSummary.guides}</li>
            <li>Tools: {featuredSummary.tools}</li>
          </ul>
        </AdminPanel>
      </div>

      <AdminPanel title="Sections">
        <ul className="divide-y divide-border">
          {[...record.sections]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((s) => (
              <li
                key={s.sectionKey}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span>
                  {HOMEPAGE_SECTION_LABELS[
                    s.sectionKey as keyof typeof HOMEPAGE_SECTION_LABELS
                  ] ?? s.sectionKey}
                </span>
                <span className="text-muted-foreground">
                  #{s.sortOrder} · {s.enabled ? "Visible" : "Hidden"}
                </span>
              </li>
            ))}
        </ul>
      </AdminPanel>
    </div>
  )
}
