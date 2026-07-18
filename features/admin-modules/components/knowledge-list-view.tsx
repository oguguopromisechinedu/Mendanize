"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { KnowledgeArticleRecord, ListResult } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createKnowledgeAction,
  deleteKnowledgeAction,
  updateKnowledgeAction,
} from "../actions/actions"

export function KnowledgeListView({
  initial,
}: {
  initial: ListResult<KnowledgeArticleRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("general")
  const [body, setBody] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Knowledge Base"
        description="Internal playbooks for editors and operators."
      />
      <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="h-9 w-40 rounded-lg border border-input bg-transparent px-3 text-sm"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Playbook body"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        <Button
          size="sm"
          disabled={pending || !title.trim()}
          onClick={() =>
            start(async () => {
              const res = await createKnowledgeAction({
                title,
                category,
                body,
                published: true,
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setTitle("")
                setBody("")
                router.refresh()
              }
            })
          }
        >
          Add article
        </Button>
      </div>

      <AdminActionToolbar>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || !selected.length}
          onClick={() => setConfirmOpen(true)}
        >
          Delete selected
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No playbooks"
          description="Document publishing checklists and ops runbooks here."
        />
      ) : (
        <AdminDataTable
          headers={["", "Title", "Category", "Published", "Updated", ""]}
        >
          {initial.items.map((article) => (
            <tr key={article.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(article.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, article.id]
                        : prev.filter((id) => id !== article.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2">
                <p className="font-medium">{article.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {article.body}
                </p>
              </td>
              <td className="px-3 py-2 text-sm">{article.category}</td>
              <td className="px-3 py-2">
                <StatusBadge
                  status={article.published ? "PUBLISHED" : "DRAFT"}
                />
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {new Date(article.updatedAt).toLocaleString()}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await updateKnowledgeAction(article.id, {
                        published: !article.published,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  {article.published ? "Unpublish" : "Publish"}
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete playbooks?"
        description="Selected knowledge articles will be removed."
        confirmLabel="Delete"
        onConfirm={() =>
          start(async () => {
            const res = await deleteKnowledgeAction({ ids: selected })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              setSelected([])
              router.refresh()
            }
            setConfirmOpen(false)
          })
        }
      />
    </div>
  )
}
