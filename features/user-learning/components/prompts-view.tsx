"use client";

import { useState } from "react";
import { Check, Copy, MessageSquareText } from "lucide-react";

import { AdminPageHeader, AdminPanel, AdminEmptyState } from "@/features/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PromptPackRecord } from "@/services/ecosystem";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 px-2 text-xs">
      {copied ? (
        <>
          <Check className="mr-1 size-3 text-primary" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1 size-3" />
          Copy
        </>
      )}
    </Button>
  );
}

export function PromptsView({ packs }: { packs: PromptPackRecord[] }) {
  const [activePackId, setActivePackId] = useState<string | null>(
    packs[0]?.id ?? null,
  );

  const activePack = packs.find((p) => p.id === activePackId) ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Prompt Library"
        description="Ready-to-use prompt packs curated by Mendanize. Copy any prompt directly into the AI Tutor or your workspace."
      />

      {packs.length === 0 ? (
        <AdminEmptyState
          title="No prompt packs published yet"
          description="The Mendanize team is curating prompt packs for you. Check back soon."
        />
      ) : (
        <div className="flex gap-6 lg:flex-row flex-col">
          <aside className="lg:w-56 shrink-0 space-y-1">
            {packs.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setActivePackId(pack.id)}
                className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activePackId === pack.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <MessageSquareText className="mt-0.5 size-4 shrink-0" />
                <span className="leading-snug">{pack.title}</span>
              </button>
            ))}
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {activePack ? (
              <>
                <AdminPanel>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-foreground">{activePack.title}</h2>
                      {activePack.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{activePack.description}</p>
                      )}
                    </div>
                    {activePack.category && (
                      <Badge variant="outline" className="shrink-0">{activePack.category}</Badge>
                    )}
                  </div>
                </AdminPanel>

                <div className="space-y-3">
                  {activePack.items.map((item) => (
                    <AdminPanel key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                        <CopyButton text={item.prompt} />
                      </div>
                      <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed font-mono">
                        {item.prompt}
                      </pre>
                    </AdminPanel>
                  ))}

                  {activePack.items.length === 0 && (
                    <AdminPanel>
                      <p className="text-sm text-muted-foreground">No prompts in this pack yet.</p>
                    </AdminPanel>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
