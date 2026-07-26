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
import type { ProjectTemplateRecord } from "@/services/ecosystem";
import {
  createProjectTemplateAction,
  updateProjectTemplateAction,
  publishProjectTemplateAction,
  deleteProjectTemplateAction,
} from "../actions/actions";

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function ProjectTemplatesView({
  templates,
}: {
  templates: ProjectTemplateRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    brief: "",
    difficulty: "BEGINNER",
    estimatedHours: "4",
  });

  function resetForm() {
    setForm({ title: "", brief: "", difficulty: "BEGINNER", estimatedHours: "4" });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createProjectTemplateAction({
        title: form.title,
        slug: slugify(form.title),
        brief: form.brief,
        difficulty: form.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        estimatedHours: parseInt(form.estimatedHours, 10) || 4,
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
      const res = await updateProjectTemplateAction(id, {
        title: form.title,
        brief: form.brief,
        difficulty: form.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        estimatedHours: parseInt(form.estimatedHours, 10) || 4,
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

  function startEdit(t: ProjectTemplateRecord) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      brief: t.brief,
      difficulty: t.difficulty,
      estimatedHours: String(t.estimatedHours),
    });
    setShowCreate(false);
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const res = await publishProjectTemplateAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteProjectTemplateAction(id);
      if (res.ok) { toast.success(res.message); setDeleteTarget(null); router.refresh(); }
      else toast.error(res.message);
    });
  }

  const inlineForm = (onSubmit: () => void, onCancel: () => void) => (
    <AdminPanel>
      <div className="space-y-3">
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          placeholder="Brief — describe what learners build"
          value={form.brief}
          onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
          rows={4}
        />
        <div className="flex gap-3">
          <select
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground"
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <Input
            type="number"
            placeholder="Est. hours"
            value={form.estimatedHours}
            onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
            className="w-28"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSubmit} disabled={!form.title || !form.brief || pending}>
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
        title="Project Templates"
        description="Define guided projects learners can start. Publish to make them available."
        actions={
          <Button size="sm" onClick={() => { setShowCreate((v) => !v); setEditingId(null); }}>
            {showCreate ? "Cancel" : "New template"}
          </Button>
        }
      />

      {showCreate && inlineForm(handleCreate, () => { setShowCreate(false); resetForm(); })}

      {templates.length === 0 && !showCreate ? (
        <AdminEmptyState
          title="No project templates yet"
          description="Create a project template and publish it. Learners will see it in their Projects section."
        />
      ) : (
        <AdminDataTable
          headers={["Title", "Difficulty", "Hours", "Status", "Actions"]}
        >
          {templates.map((t) => (
            <>
              <tr key={t.id}>
                <td className="px-3 py-2.5 font-medium text-foreground">{t.title}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {DIFFICULTY_LABELS[t.difficulty] ?? t.difficulty}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{t.estimatedHours}h</td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={t.status.toLowerCase()} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => startEdit(t)} disabled={pending}>
                      Edit
                    </Button>
                    {t.status !== "PUBLISHED" && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(t.id)} disabled={pending}>
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(t.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
              {editingId === t.id && (
                <tr key={`${t.id}-edit`}>
                  <td colSpan={5} className="bg-muted/10 px-4 py-4">
                    {inlineForm(
                      () => handleUpdate(t.id),
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
        title="Delete project template?"
        description="Learner projects linked to this template will also be removed."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        pending={pending}
      />
    </div>
  );
}
