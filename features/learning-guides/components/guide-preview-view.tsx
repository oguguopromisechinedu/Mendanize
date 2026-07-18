import Link from "next/link"

import type { GuideRecord } from "@/services/content/types"
import type { RecommendationItem } from "@/services/recommendations/types"
import { StatusBadge } from "@/features/admin-dashboard"
import { RecommendationsRail } from "@/features/recommendations"
import { Button } from "@/components/ui/button"
import {
  GUIDE_DIFFICULTY_LABELS,
} from "../constants/constants"

/** Responsive admin preview — public guide pages are MES-026. */
export function GuidePreviewView({
  guide,
  related = [],
}: {
  guide: GuideRecord
  related?: RecommendationItem[]
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={guide.status.toLowerCase()} />
            <span className="text-sm text-muted-foreground">
              {GUIDE_DIFFICULTY_LABELS[guide.difficulty]} ·{" "}
              {guide.estimatedMinutes} min
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/guides/${guide.id}`}>Edit</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/guides">Back to list</Link>
          </Button>
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface/40 px-5 py-8 sm:px-8">
        {guide.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.coverImageUrl}
            alt={guide.coverImageAlt || ""}
            className="mb-6 aspect-[2/1] w-full rounded-lg object-cover"
          />
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {guide.title}
        </h1>
        {guide.shortDescription ? (
          <p className="mt-3 text-lg text-muted-foreground">
            {guide.shortDescription}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{guide.authorName ?? "Author"}</span>
          {guide.categoryName ? <span>· {guide.categoryName}</span> : null}
          {guide.topicName ? <span>· {guide.topicName}</span> : null}
        </div>

        {guide.learningObjectives.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Learning objectives
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {guide.learningObjectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {guide.prerequisites.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Prerequisites
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {guide.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Progress tracking placeholder — learner progress lands with
          personalization (MES-021 / GuideProgress).
        </div>

        <div className="mt-8 space-y-6">
          {guide.sections.map((section, si) => (
            <section key={section.id}>
              <h2 className="font-display text-xl font-semibold">
                {si + 1}. {section.title}
              </h2>
              {section.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.description}
                </p>
              ) : null}
              <ol className="mt-3 space-y-3">
                {section.lessons.map((lesson, li) => (
                  <li
                    key={lesson.id}
                    className="rounded-lg border border-border/70 bg-background/40 px-3 py-3"
                  >
                    <p className="text-sm font-medium">
                      {si + 1}.{li + 1} {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.readingTimeMin} min read
                      {lesson.videoUrl ? " · video" : ""}
                      {lesson.codeExample ? " · code" : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </article>

      <RecommendationsRail title="Related learning" items={related} />
    </div>
  )
}
