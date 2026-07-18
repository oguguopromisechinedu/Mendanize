import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { AskContextualWidget } from "@/features/ask-mendanize";
import { RecommendationsRail } from "@/features/recommendations";
import type { ToolRecord } from "@/services/content";
import type { RecommendationItem } from "@/services/recommendations";
import {
  TOOL_AVAILABILITY_LABELS,
  TOOL_DIFFICULTY_LABELS,
  TOOL_FEATURE_KIND_LABELS,
  TOOL_PRICING_LABELS,
} from "../../constants/constants";
import { ToolComparisonPlaceholder } from "./tool-comparison-placeholder";
import { ToolLearningPanel } from "./tool-learning-panel";

export function ToolDetailView({
  tool,
  related,
  structuredData,
  breadcrumbJsonLd,
}: {
  tool: ToolRecord;
  related: RecommendationItem[];
  structuredData?: Record<string, unknown> | null;
  breadcrumbJsonLd?: Record<string, unknown> | null;
}) {
  const byKind = (kind: ToolRecord["features"][number]["kind"]) =>
    tool.features.filter((f) => f.kind === kind);

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      ) : null}
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
      ) : null}

      <div className="mx-auto max-w-4xl space-y-10">
        <article>
          {tool.coverUrl ? (
            <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.coverUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}

          <header className="flex flex-wrap items-start gap-4">
            {tool.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tool.logoUrl}
                alt=""
                className="size-16 rounded-lg border border-border bg-background object-contain p-1"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {tool.featured ? (
                  <Badge variant="secondary">Featured</Badge>
                ) : null}
                <Badge variant="outline">
                  {TOOL_PRICING_LABELS[tool.pricing]}
                </Badge>
                <Badge variant="outline">
                  {TOOL_DIFFICULTY_LABELS[tool.difficulty]}
                </Badge>
                <Badge variant="outline">
                  {TOOL_AVAILABILITY_LABELS[tool.availability]}
                </Badge>
              </div>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
                {tool.name}
              </h1>
              {tool.developer ? (
                <p className="mt-2 text-sm text-muted-foreground">
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
              ) : tool.websiteUrl ? (
                <p className="mt-2 text-sm">
                  <a
                    href={tool.websiteUrl}
                    className="text-primary underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit website
                  </a>
                </p>
              ) : null}
            </div>
          </header>

          {tool.shortDescription ? (
            <p className="mt-5 text-lg text-muted-foreground">
              {tool.shortDescription}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {tool.categoryNames.map((c) => (
              <span
                key={c}
                className="rounded-md border border-border px-2 py-0.5"
              >
                {c}
              </span>
            ))}
            {tool.topicNames.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border px-2 py-0.5"
              >
                {t}
              </span>
            ))}
            {tool.platforms.map((p) => (
              <span
                key={p}
                className="rounded-md border border-border px-2 py-0.5"
              >
                {p}
              </span>
            ))}
          </div>

          {tool.fullDescription ? (
            <div
              className="prose prose-neutral mt-8 max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: tool.fullDescription }}
            />
          ) : null}

          {(
            ["FEATURE", "USE_CASE", "ADVANTAGE", "LIMITATION"] as const
          ).map((kind) => {
            const items = byKind(kind);
            if (!items.length) return null;
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
            );
          })}

          {tool.recommendedFor.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended audience
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
        </article>

        <ToolLearningPanel tool={tool} />

        <AskContextualWidget
          contextType="AI_TOOL"
          contextId={tool.id}
          contextTitle={tool.name}
          contextExcerpt={tool.shortDescription}
          suggestions={[
            "Explain this tool",
            "Compare similar tools",
            "Recommend alternatives",
          ]}
        />

        <RecommendationsRail title="Related learning resources" items={related} />

        <ToolComparisonPlaceholder />

        <p className="text-sm">
          <Link href="/ai-tools" className="text-primary hover:underline">
            ← All AI tools
          </Link>
        </p>
      </div>
    </>
  );
}
