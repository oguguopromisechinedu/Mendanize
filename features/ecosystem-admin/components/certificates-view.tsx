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
import type { CertificateTemplateRecord } from "@/services/ecosystem";
import {
  createCertificateTemplateAction,
  updateCertificateTemplateAction,
  publishCertificateTemplateAction,
  deleteCertificateTemplateAction,
} from "../actions/actions";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function CertificatesAdminView({
  templates,
}: {
  templates: CertificateTemplateRecord[];
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
    badgeUrl: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", guideId: "", badgeUrl: "" });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createCertificateTemplateAction({
        title: form.title,
        slug: slugify(form.title),
        description: form.description || null,
        guideId: form.guideId,
        badgeUrl: form.badgeUrl || null,
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
      const res = await updateCertificateTemplateAction(id, {
        title: form.title,
        description: form.description || null,
        guideId: form.guideId,
        badgeUrl: form.badgeUrl || null,
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

  function startEdit(t: CertificateTemplateRecord) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description ?? "",
      guideId: t.guideId,
      badgeUrl: t.badgeUrl ?? "",
    });
    setShowCreate(false);
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const res = await publishCertificateTemplateAction(id);
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteCertificateTemplateAction(id);
      if (res.ok) { toast.success(res.message); setDeleteTarget(null); router.refresh(); }
      else toast.error(res.message);
    });
  }

  const templateForm = (onSubmit: () => void, onCancel: () => void) => (
    <AdminPanel>
      <div className="space-y-3">
        <Input
          placeholder="Certificate title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          placeholder="Description (shown on certificate)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
        <Input
          placeholder="Guide ID (the guide this certifies)"
          value={form.guideId}
          onChange={(e) => setForm((f) => ({ ...f, guideId: e.target.value }))}
        />
        <Input
          placeholder="Badge image URL (optional)"
          value={form.badgeUrl}
          onChange={(e) => setForm((f) => ({ ...f, badgeUrl: e.target.value }))}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSubmit} disabled={!form.title || !form.guideId || pending}>
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
        title="Certificates"
        description="One certificate template per guide. Learners receive a certificate after completing the linked guide."
        actions={
          <Button size="sm" onClick={() => { setShowCreate((v) => !v); setEditingId(null); }}>
            {showCreate ? "Cancel" : "New certificate"}
          </Button>
        }
      />

      {showCreate && templateForm(handleCreate, () => { setShowCreate(false); resetForm(); })}

      {templates.length === 0 && !showCreate ? (
        <AdminEmptyState
          title="No certificate templates yet"
          description="Create a certificate template linked to a guide, then publish it."
        />
      ) : (
        <AdminDataTable headers={["Title", "Guide ID", "Status", "Actions"]}>
          {templates.map((t) => (
            <>
              <tr key={t.id}>
                <td className="px-3 py-2.5 font-medium text-foreground">{t.title}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{t.guideId}</td>
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
                  <td colSpan={4} className="bg-muted/10 px-4 py-4">
                    {templateForm(
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
        title="Delete certificate template?"
        description="Any certificates already issued to learners will remain, but new ones cannot be issued."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        pending={pending}
      />
    </div>
  );
}
