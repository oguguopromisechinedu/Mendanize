"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { HomepageAdminRecord } from "@/services/content/types"
import type { FeaturedPickerOptions } from "../types/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { updateHomepageAction } from "../actions/actions"
import { HomepageCmsNav } from "./homepage-cms-nav"

export function HomepageLatestArticlesView({
  record,
  options,
}: {
  record: HomepageAdminRecord
  options: FeaturedPickerOptions
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...record.latestArticles })

  function toggleArticle(id: string) {
    setForm((prev) => {
      const has = prev.articleIds.includes(id)
      return {
        ...prev,
        articleIds: has
          ? prev.articleIds.filter((x) => x !== id)
          : [...prev.articleIds, id],
      }
    })
  }

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({ latestArticles: form })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Latest articles"
        description="Controls the article list beside the newsletter signup."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <HomepageCmsNav />

      <AdminPanel title="Source">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select
              value={form.mode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  mode: e.target.value as "AUTOMATIC" | "MANUAL",
                }))
              }
            >
              <option value="MANUAL">Manual picks</option>
              <option value="AUTOMATIC">Latest published</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Display limit</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={form.limit}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  limit: Number(e.target.value) || 5,
                }))
              }
            />
          </div>
        </div>
      </AdminPanel>

      {form.mode === "MANUAL" ? (
        <AdminPanel title="Select articles">
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {options.articles.map((article) => {
              const selected = form.articleIds.includes(article.id)
              return (
                <li key={article.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => toggleArticle(article.id)}
                  >
                    {article.title}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {form.articleIds.length} selected. Order follows selection order.
          </p>
        </AdminPanel>
      ) : (
        <AdminPanel title="Automatic mode">
          <p className="text-sm text-muted-foreground">
            Shows the most recently published articles up to the display limit.
            Thumbnails come from each article&apos;s featured image in the
            Articles CMS.
          </p>
        </AdminPanel>
      )}
    </div>
  )
}
