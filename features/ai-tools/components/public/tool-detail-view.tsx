import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AskContextualWidget } from "@/features/ask-mendanize";
import { RecommendationsRail } from "@/features/recommendations";
import {
  contentListHref,
  type ContentScope,
} from "@/lib/content-paths";
import type { ToolRecord } from "@/services/content";
import type { RecommendationItem } from "@/services/recommendations";
import {
  TOOL_AVAILABILITY_LABELS,
  TOOL_DIFFICULTY_LABELS,
  TOOL_FEATURE_KIND_LABELS,
  TOOL_PRICING_LABELS,
} from "../../constants/constants";
import { ToolFavoriteButton } from "./tool-favorite-button";
import { ToolLearningPanel } from "./tool-learning-panel";

export function ToolDetailView({
  tool,
  related,
  structuredData,
  breadcrumbJsonLd,
  scope = "public",
  signedIn = false,
  isFavorite = false,
}: {
  tool: ToolRecord;
  related: RecommendationItem[];
  structuredData?: Record<string, unknown> | null;
  breadcrumbJsonLd?: Record<string, unknown> | null;
  scope?: ContentScope;
  signedIn?: boolean;
  isFavorite?: boolean;
}) {
  const byKind = (kind: ToolRecord["features"][number]["kind"]) =>
    tool.features.filter((f) => f.kind === kind);

  const useUrl = tool.websiteUrl || tool.documentationUrl;

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
                <div className="mt-3 rounded-lg border border-border bg-card/40 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Developer
                  </p>
                  <p className="mt-1 text-sm text-foreground">{tool.developer}</p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {useUrl ? (
                  <Button asChild>
                    <a href={useUrl} target="_blank" rel="noreferrer">
                      {tool.websiteUrl ? "Install / Use" : "Documentation"}
                    </a>
                  </Button>
                ) : null}
                <ToolFavoriteButton
                  toolId={tool.id}
                  signedIn={signedIn}
                  initialFavorite={isFavorite}
                />
                {tool.documentationUrl && tool.websiteUrl ? (
                  <Button asChild variant="outline">
                    <a
                      href={tool.documentationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Docs
                    </a>
                  </Button>
                ) : null}
              </div>
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

          {(["FEATURE", "USE_CASE", "ADVANTAGE", "LIMITATION"] as const).map(
            (kind) => {
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
            }
          )}

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
        </article>

        <ToolLearningPanel tool={tool} />

        <section className="rounded-xl border border-border p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">
            Explore more tools
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter the directory by pricing, difficulty, and category to
            compare options that fit your goals.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={contentListHref("ai_tool", { scope })}>
              Browse AI Tools
            </Link>
          </Button>
        </section>

        <RecommendationsRail items={related} title="Related picks" />
        <AskContextualWidget
          contextType="AI_TOOL"
          contextId={tool.id}
          contextTitle={tool.name}
        />
      </div>
    </>
  );
}
