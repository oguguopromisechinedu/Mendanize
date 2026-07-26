"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FeaturedSettingRecord } from "@/services/ecosystem";
import { updateFeaturedSettingAction } from "../actions/actions";

function parseIds(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function idsToText(ids: string[]): string {
  return ids.join("\n");
}

export function FeaturedLearningView({
  setting,
}: {
  setting: FeaturedSettingRecord | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [guideIds, setGuideIds] = useState(idsToText(setting?.featuredGuideIds ?? []));
  const [articleIds, setArticleIds] = useState(idsToText(setting?.featuredArticleIds ?? []));
  const [toolIds, setToolIds] = useState(idsToText(setting?.featuredToolIds ?? []));
  const [packIds, setPackIds] = useState(idsToText(setting?.featuredPromptPackIds ?? []));
  const [projectIds, setProjectIds] = useState(idsToText(setting?.featuredProjectIds ?? []));

  function handleSave() {
    startTransition(async () => {
      const res = await updateFeaturedSettingAction({
        featuredGuideIds: parseIds(guideIds),
        featuredArticleIds: parseIds(articleIds),
        featuredToolIds: parseIds(toolIds),
        featuredPromptPackIds: parseIds(packIds),
        featuredProjectIds: parseIds(projectIds),
      });
      if (res.ok) { toast.success(res.message); router.refresh(); }
      else toast.error(res.message);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Featured Learning"
        description="Control which guides, articles, AI tools, prompt packs and projects are featured on the learner home screen. Enter one ID per line."
        actions={
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminPanel title="Featured Guides" description="Guide IDs (one per line)">
          <Textarea
            rows={6}
            value={guideIds}
            onChange={(e) => setGuideIds(e.target.value)}
            placeholder="guide-id-here"
            className="font-mono text-xs"
          />
        </AdminPanel>

        <AdminPanel title="Featured Articles" description="Article IDs (one per line)">
          <Textarea
            rows={6}
            value={articleIds}
            onChange={(e) => setArticleIds(e.target.value)}
            placeholder="article-id-here"
            className="font-mono text-xs"
          />
        </AdminPanel>

        <AdminPanel title="Featured AI Tools" description="Tool IDs (one per line)">
          <Textarea
            rows={6}
            value={toolIds}
            onChange={(e) => setToolIds(e.target.value)}
            placeholder="tool-id-here"
            className="font-mono text-xs"
          />
        </AdminPanel>

        <AdminPanel title="Featured Prompt Packs" description="Pack IDs (one per line)">
          <Textarea
            rows={6}
            value={packIds}
            onChange={(e) => setPackIds(e.target.value)}
            placeholder="pack-id-here"
            className="font-mono text-xs"
          />
        </AdminPanel>

        <AdminPanel
          title="Featured Projects"
          description="Project template IDs (one per line)"
          className="sm:col-span-2"
        >
          <Textarea
            rows={4}
            value={projectIds}
            onChange={(e) => setProjectIds(e.target.value)}
            placeholder="project-template-id-here"
            className="font-mono text-xs"
          />
        </AdminPanel>
      </div>

      {setting?.updatedAt && (
        <p className="text-xs text-muted-foreground">
          Last saved: {new Date(setting.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
