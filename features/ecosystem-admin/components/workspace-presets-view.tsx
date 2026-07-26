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
import type { WorkspacePresetRecord } from "@/services/ecosystem";
import {
  createWorkspacePresetAction,
  updateWorkspacePresetAction,
  publishWorkspacePresetAction,
  deleteWorkspacePresetAction,
} from "../actions/actions";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function WorkspacePresetsView({
  presets,
}: {
  presets: WorkspacePresetRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    guideId: "",
    starterPrompt: "",
    challengeNote: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", guideId: "", starterPrompt: "", challengeNote: "" });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createWorkspacePresetAction({
        title: form.title,
        slug: slugify(form.title),
        description: form.description || null,
        guideId: form.guideId || null,
        starterPrompt: form.starterPrompt || null,
        challengeNote: form.challengeNote || null,
      });
      if (res.ok) {
        toast.success(res.message);
        setShowCreate(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleUpdate(id: string) {
    startTransition(async () => {
      const res = await updateWorkspacePresetAction(id, {
        title: form.title,
        description: form.description || null,
        guideId: form.guideId || null,
        starterPrompt: form.starterPrompt || null,
        challengeNote: form.challengeNote || null,
      });
      if (res.ok) {
        toast.success(res.message);
        setEditingId(null);
        resetForm();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  function startEdit(p: WorkspacePresetRecord) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? "",
      guideId: p.guideId ?? "",
      starterPrompt: p.starterPrompt ?? "",
      challengeNote: p.challengeNote ?? "",
    });
    setShowCreate(false);
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const res = await publishWorkspacePresetAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteWorkspacePresetAction(id);
      if (res.ok) { toast.success(res.message); setDeleteTarget(null); router.refresh(); }
      else toast.error(res.message);
    });
  }

  const presetForm = (onSubmit: () => void, onCancel: () => void) => (
    <AdminPanel>
      <div className="space-y-3">
        <Input
          placeholder="Preset title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          placeholder="Description — what will the learner practice?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />
        <Input
          placeholder="Linked guide ID (optional)"
          value={form.guideId}
          onChange={(e) => setForm((f) => ({ ...f, guideId: e.target.value }))}
        />
        <Textarea
          placeholder="Starter prompt (shown in the AI workspace)"
          value={form.starterPrompt}
          onChange={(e) => setForm((f) => ({ ...f, starterPrompt: e.target.value }))}
          rows={4}
        />
        <Textarea
          placeholder="Challenge note — optional extra context"
          value={form.challengeNote}
          onChange={(e) => setForm((f) => ({ ...f, challengeNote: e.target.value }))}
          rows={2}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSubmit} disabled={!form.title || pending}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </AdminPanel>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Workspace Presets"
        description="Pre-built AI workspace configurations for learners. Each preset appears in the learner Coding Workspace."
        actions={
          <Button size="sm" onClick={() => { setShowCreate((v) => !v); setEditingId(null); }}>
            {showCreate ? "Cancel" : "New preset"}
          </Button>
        }
      />

      {showCreate && presetForm(handleCreate, () => { setShowCreate(false); resetForm(); })}

      {presets.length === 0 && !showCreate ? (
        <AdminEmptyState
          title="No workspace presets yet"
          description="Create a workspace preset with a starter prompt and publish it for learners."
        />
      ) : (
        <AdminDataTable headers={["Title", "Guide linked", "Status", "Actions"]}>
          {presets.map((p) => (
            <>
              <tr key={p.id}>
                <td className="px-3 py-2.5 font-medium text-foreground">{p.title}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {p.guideId ? (
                    <span className="font-mono text-xs">{p.guideId}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={p.status.toLowerCase()} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)} disabled={pending}>
                      Edit
                    </Button>
                    {p.status !== "PUBLISHED" && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(p.id)} disabled={pending}>
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(p.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
              {editingId === p.id && (
                <tr key={`${p.id}-edit`}>
                  <td colSpan={4} className="bg-muted/10 px-4 py-4">
                    {presetForm(
                      () => handleUpdate(p.id),
                      () => { setEditingId(null); resetForm(); },
                    )}
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
        title="Delete workspace preset?"
        description="This will permanently remove this preset from the learner workspace."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        pending={pending}
      />
    </div>
  );
}
