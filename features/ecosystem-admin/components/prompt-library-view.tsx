"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AdminPageHeader,
  AdminPanel,
  AdminDataTable,
  AdminEmptyState,
  StatusBadge,
  ConfirmationDialog,
} from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PromptPackRecord } from "@/services/ecosystem";
import {
  createPromptPackAction,
  publishPromptPackAction,
  archivePromptPackAction,
  deletePromptPackAction,
  createPromptPackItemAction,
  deletePromptPackItemAction,
} from "../actions/actions";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function PromptLibraryView({ packs }: { packs: PromptPackRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCategory, setCreateCategory] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptBody, setNewPromptBody] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleCreate() {
    startTransition(async () => {
      const res = await createPromptPackAction({
        title: createTitle,
        slug: slugify(createTitle),
        description: createDesc || null,
        category: createCategory || null,
      });
      if (res.ok) {
        toast.success(res.message);
        setShowCreate(false);
        setCreateTitle("");
        setCreateDesc("");
        setCreateCategory("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const res = await publishPromptPackAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      const res = await archivePromptPackAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deletePromptPackAction(id);
      if (res.ok) { toast.success(res.message); setDeleteTarget(null); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleAddItem(packId: string) {
    startTransition(async () => {
      const res = await createPromptPackItemAction(packId, {
        title: newPromptTitle,
        prompt: newPromptBody,
      });
      if (res.ok) {
        toast.success(res.message);
        setNewPromptTitle("");
        setNewPromptBody("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleDeleteItem(id: string) {
    startTransition(async () => {
      const res = await deletePromptPackItemAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Prompt Library"
        description="Manage prompt packs available to learners. Publish a pack to make it visible in the learner Prompt Library."
        actions={
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Cancel" : "New pack"}
          </Button>
        }
      />

      {showCreate && (
        <AdminPanel title="Create prompt pack">
          <div className="space-y-3">
            <Input
              placeholder="Pack title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
            />
            <Input
              placeholder="Category (optional)"
              value={createCategory}
              onChange={(e) => setCreateCategory(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              rows={3}
            />
            <Button size="sm" onClick={handleCreate} disabled={!createTitle || pending}>
              Create
            </Button>
          </div>
        </AdminPanel>
      )}

      {packs.length === 0 ? (
        <AdminEmptyState
          title="No prompt packs yet"
          description="Create your first pack to get started. Learners will see published packs in their Prompt Library."
        />
      ) : (
        <AdminDataTable
          headers={["Title", "Category", "Items", "Status", "Actions"]}
        >
          {packs.map((pack) => (
            <>
              <tr
                key={pack.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedId(expandedId === pack.id ? null : pack.id)}
              >
                <td className="px-3 py-2.5 font-medium text-foreground">{pack.title}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{pack.category ?? "—"}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{pack.items.length}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={pack.status.toLowerCase()} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {pack.status !== "PUBLISHED" && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(pack.id)} disabled={pending}>
                        Publish
                      </Button>
                    )}
                    {pack.status === "PUBLISHED" && (
                      <Button size="sm" variant="outline" onClick={() => handleArchive(pack.id)} disabled={pending}>
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(pack.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>

              {expandedId === pack.id && (
                <tr key={`${pack.id}-expanded`}>
                  <td colSpan={5} className="bg-muted/10 px-4 py-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Prompts in this pack
                      </p>
                      {pack.items.length === 0 && (
                        <p className="text-sm text-muted-foreground">No prompts yet.</p>
                      )}
                      <div className="space-y-2">
                        {pack.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface/60 p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{item.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {item.prompt}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={pending}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Add prompt
                        </p>
                        <Input
                          placeholder="Prompt title"
                          value={newPromptTitle}
                          onChange={(e) => setNewPromptTitle(e.target.value)}
                        />
                        <Textarea
                          placeholder="Prompt text"
                          value={newPromptBody}
                          onChange={(e) => setNewPromptBody(e.target.value)}
                          rows={3}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(pack.id)}
                          disabled={!newPromptTitle || !newPromptBody || pending}
                        >
                          Add prompt
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete prompt pack?"
        description="This will permanently delete the pack and all its prompts."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        pending={pending}
      />
    </div>
  );
}
