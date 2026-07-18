"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel, StatusBadge } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AnnouncementRecord } from "@/services/notification";
import { saveAnnouncementAction } from "../actions/actions";
import { NotificationsNav } from "./notifications-nav";

export function AnnouncementsView({
  announcements,
}: {
  announcements: AnnouncementRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] =
    useState<AnnouncementRecord["kind"]>("PLATFORM");

  function create() {
    startTransition(async () => {
      const res = await saveAnnouncementAction({ kind, title, body, active: true });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        setTitle("");
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Announcements"
        description="Platform, maintenance (MES-020), feature releases, and learning campaigns."
      />
      <NotificationsNav />

      <AdminPanel title="Create announcement">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as AnnouncementRecord["kind"])
              }
            >
              <option value="PLATFORM">Platform</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="FEATURE">Feature</option>
              <option value="LEARNING">Learning</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button size="sm" disabled={pending || !title.trim()} onClick={create}>
            Publish
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title={`${announcements.length} announcements`}>
        <ul className="divide-y divide-border">
          {announcements.map((a) => (
            <li key={a.id} className="flex flex-wrap justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.kind} · {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={a.active ? "active" : "archived"} />
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
