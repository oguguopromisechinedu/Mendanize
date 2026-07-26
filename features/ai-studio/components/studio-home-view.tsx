"use client"

import Link from "next/link"
import { StatusBadge } from "@/features/admin-dashboard"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type {
  AIGenerationListResult,
  AiProviderStatus,
} from "@/services/ai/types"
import { STUDIO_CARDS } from "../constants/constants"

export function StudioHomeView({
  providers,
  recent,
}: {
  providers: AiProviderStatus[]
  recent: AIGenerationListResult
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="AI Studio"
        description="Internal content production — distinct from learner-facing Ask Mendanize AI."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/settings/ai">AI settings</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/ai-studio/history">History</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STUDIO_CARDS.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="rounded-xl border border-border bg-surface/60 p-4 transition-colors hover:border-primary/40 hover:bg-hover"
          >
            <p className="font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel
          title="AI & API status"
          description="Anthropic owns articles; OpenAI owns images. Status reflects ANTHROPIC_API_KEY and OPENAI_API_KEY."
        >
          <ul className="space-y-2">
            {providers.map((p) => (
              <li
                key={p.provider}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">{p.provider}</p>
                  <p className="text-xs text-muted-foreground">{p.message}</p>
                </div>
                <StatusBadge
                  status={p.connected ? "connected" : "disconnected"}
                />
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel title="Recent generations">
          {recent.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No generations yet. Start with an article or image.
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.items.map((g) => (
                <li
                  key={g.id}
                  className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{g.type}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {g.prompt}
                    </p>
                  </div>
                  <StatusBadge status={g.status.toLowerCase()} />
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <p className="text-xs text-muted-foreground">
        Publishing workflow: Topic → Claude article + OpenAI image → SEO →
        Review → Publish. Studio powers the generation steps.
      </p>
    </div>
  )
}
