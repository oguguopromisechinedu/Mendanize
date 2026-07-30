"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  createEmsCategoryAction,
  deleteEmsCategoryAction,
} from "../actions"
import { EmsNav } from "./ems-nav"

export function EmsCategoriesView({
  categories,
  canDelete,
}: {
  categories: Array<{
    id: string
    name: string
    slug: string
    systemCritical: boolean
  }>
  canDelete: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState("")

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email categories"
        description="Group templates and filter analytics. System-critical categories cannot be deleted."
      />
      <EmsNav />
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          className="h-9 min-w-[200px] flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
        />
        <Button
          size="sm"
          disabled={pending || !name.trim()}
          onClick={() =>
            start(async () => {
              const res = await createEmsCategoryAction(name)
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setName("")
                router.refresh()
              }
            })
          }
        >
          Add
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {c.slug}
                {c.systemCritical ? " · system-critical" : ""}
              </div>
            </div>
            {canDelete && !c.systemCritical ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await deleteEmsCategoryAction(c.id)
                    if (!res.ok) toast.error(res.message)
                    else {
                      toast.success(res.message)
                      router.refresh()
                    }
                  })
                }
              >
                Delete
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
