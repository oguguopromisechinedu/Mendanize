import Link from "next/link"

import type { ToolRecord } from "@/services/content/types"
import type { RecommendationItem } from "@/services/recommendations/types"
import { StatusBadge } from "@/features/admin-dashboard"
import { RecommendationsRail } from "@/features/recommendations"
import { Button } from "@/components/ui/button"
import {
  TOOL_AVAILABILITY_LABELS,
  TOOL_DIFFICULTY_LABELS,
  TOOL_FEATURE_KIND_LABELS,
  TOOL_PRICING_LABELS,
} from "../constants/constants"

/** Admin preview approximating the public AI Tool page (MES-027). */
export function ToolPreviewView({
  tool,
  related = [],
}: {
  tool: ToolRecord
  related?: RecommendationItem[]
}) {
  const byKind = (kind: ToolRecord["features"][number]["kind"]) =>
    tool.features.filter((f) => f.kind === kind)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tool.status.toLowerCase()} />
            <span className="text-sm text-muted-foreground">
              {TOOL_PRICING_LABELS[tool.pricing]} ·{" "}
              {TOOL_DIFFICULTY_LABELS[tool.difficulty]} ·{" "}
              {TOOL_AVAILABILITY_LABELS[tool.availability]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/ai-tools/${tool.id}`}>Edit</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/ai-tools">Back to list</Link>
          </Button>
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface/40 px-5 py-8 sm:px-8">
        {tool.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.coverUrl}
            alt=""
            className="mb-6 aspect-[2/1] w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="flex flex-wrap items-start gap-4">
          {tool.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.logoUrl}
              alt=""
              className="size-16 rounded-lg border border-border bg-background object-contain p-1"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {tool.name}
            </h1>
            {tool.developer ? (
              <p className="mt-1 text-sm text-muted-foreground">
                by {tool.developer}
                {tool.websiteUrl ? (
                  <>
                    {" · "}
                    <a
                      href={tool.websiteUrl}
                      className="text-primary underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Website
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        {tool.shortDescription ? (
          <p className="mt-4 text-lg text-muted-foreground">
            {tool.shortDescription}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {tool.categoryNames.map((c) => (
            <span key={c} className="rounded-md border border-border px-2 py-0.5">
              {c}
            </span>
          ))}
          {tool.topicNames.map((t) => (
            <span key={t} className="rounded-md border border-border px-2 py-0.5">
              {t}
            </span>
          ))}
          {tool.platforms.map((p) => (
            <span key={p} className="rounded-md border border-border px-2 py-0.5">
              {p}
            </span>
          ))}
        </div>

        {tool.fullDescription ? (
          <div
            className="prose prose-sm mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: tool.fullDescription }}
          />
        ) : null}

        {(
          ["FEATURE", "USE_CASE", "ADVANTAGE", "LIMITATION"] as const
        ).map((kind) => {
          const items = byKind(kind)
          if (!items.length) return null
          return (
            <div key={kind} className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {TOOL_FEATURE_KIND_LABELS[kind]}s
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {items.map((f) => (
                  <li key={f.id}>{f.label}</li>
                ))}
              </ul>
            </div>
          )
        })}

        {tool.learningOutcomes.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Learning outcomes
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {tool.learningOutcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {tool.recommendedFor.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended for
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {tool.recommendedFor.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {tool.images.some((i) => i.kind === "SCREENSHOT") ? (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Screenshots
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {tool.images
                .filter((i) => i.kind === "SCREENSHOT")
                .map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt || ""}
                    className="aspect-video w-full rounded-lg border border-border object-cover"
                  />
                ))}
            </div>
          </div>
        ) : null}

        {tool.demoVideoUrl ? (
          <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Demo video placeholder:{" "}
            <a
              href={tool.demoVideoUrl}
              className="text-primary underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {tool.demoVideoUrl}
            </a>
          </div>
        ) : null}

        <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Reviews, ratings, and public directory polish land with MES-027.
        </div>
      </article>

      <RecommendationsRail title="Related content" items={related} />
    </div>
  )
}
