"use client";

import { useState } from "react";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";

import { AdminPageHeader, AdminPanel, AdminEmptyState } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkspacePresetRecord } from "@/services/ecosystem";

export function WorkspaceView({ presets }: { presets: WorkspacePresetRecord[] }) {
  const [activeId, setActiveId] = useState<string | null>(presets[0]?.id ?? null);

  const activePreset = presets.find((p) => p.id === activeId) ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Coding Workspace"
        description="AI-powered workspace presets. Select a preset to load a starter prompt into the AI Tutor, then build."
        actions={
          <Button asChild size="sm">
            <Link href="/ask">
              <ExternalLink className="mr-1.5 size-3.5" />
              Open AI Tutor
            </Link>
          </Button>
        }
      />

      {presets.length === 0 ? (
        <AdminEmptyState
          title="No workspace presets yet"
          description="The Mendanize team is preparing workspace presets with guided coding challenges. Check back soon."
          actionLabel="Open AI Tutor"
          href="/ask"
        />
      ) : (
        <div className="flex gap-6 lg:flex-row flex-col">
          <aside className="lg:w-56 shrink-0 space-y-1">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeId === p.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Code2 className="mt-0.5 size-4 shrink-0" />
                <span className="leading-snug">{p.title}</span>
              </button>
            ))}
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {activePreset && (
              <>
                <AdminPanel>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-foreground">{activePreset.title}</h2>
                      {activePreset.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{activePreset.description}</p>
                      )}
                    </div>
                    {activePreset.guideId && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Linked to guide
                      </Badge>
                    )}
                  </div>
                </AdminPanel>

                {activePreset.starterPrompt && (
                  <AdminPanel title="Starter prompt" description="Use this to kick off your session in the AI Tutor">
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed font-mono">
                      {activePreset.starterPrompt}
                    </pre>
                    <Button asChild size="sm" className="mt-3">
                      <Link
                        href={`/ask?prompt=${encodeURIComponent(activePreset.starterPrompt)}`}
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        Open in AI Tutor
                      </Link>
                    </Button>
                  </AdminPanel>
                )}

                {activePreset.challengeNote && (
                  <AdminPanel
                    title="Challenge"
                    description="Extra context for this workspace session"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activePreset.challengeNote}
                    </p>
                  </AdminPanel>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
