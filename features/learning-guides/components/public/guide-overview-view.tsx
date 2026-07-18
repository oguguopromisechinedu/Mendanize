import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AskContextualWidget } from "@/features/ask-mendanize";
import type { GuideRecord } from "@/services/content";
import { flattenGuideLessons } from "@/services/content";
import type { RecommendationItem } from "@/services/recommendations";
import { GUIDE_DIFFICULTY_LABELS } from "../../constants/constants";
import { GuideResourcePanel } from "./guide-resource-panel";

export function GuideOverviewView({
  guide,
  related,
  structuredData,
  breadcrumbJsonLd,
}: {
  guide: GuideRecord;
  related: RecommendationItem[];
  structuredData?: Record<string, unknown> | null;
  breadcrumbJsonLd?: Record<string, unknown> | null;
}) {
  const lessons = flattenGuideLessons(guide);
  const firstLesson = lessons[0] ?? null;

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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {guide.categoryName ? (
                guide.categorySlug ? (
                  <Link
                    href={`/categories/${guide.categorySlug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {guide.categoryName}
                  </Link>
                ) : (
                  <Link
                    href="/categories"
                    className="font-medium text-primary hover:underline"
                  >
                    {guide.categoryName}
                  </Link>
                )
              ) : null}
              {guide.topicName ? (
                guide.topicSlug ? (
                  <Link
                    href={`/topics/${guide.topicSlug}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    · {guide.topicName}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    · {guide.topicName}
                  </span>
                )
              ) : null}
              <Badge variant="secondary">
                {GUIDE_DIFFICULTY_LABELS[guide.difficulty]}
              </Badge>
              {guide.featured ? (
                <Badge variant="outline">Featured</Badge>
              ) : null}
            </div>

            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
              {guide.title}
            </h1>

            {guide.shortDescription ? (
              <p className="mt-4 text-lg text-muted-foreground">
                {guide.shortDescription}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{guide.authorName ?? "Mendanize Editorial"}</span>
              <span>· {guide.estimatedMinutes} min</span>
              <span>
                · {guide.sectionCount} sections · {guide.lessonCount} lessons
              </span>
            </div>
          </header>

          {guide.coverImageUrl ? (
            <div className="relative mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guide.coverImageUrl}
                alt={guide.coverImageAlt || guide.title}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}

          {guide.fullDescription ? (
            <div
              className="prose prose-neutral mt-8 max-w-3xl dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: guide.fullDescription }}
            />
          ) : null}

          {guide.learningObjectives.length > 0 ? (
            <section className="mt-10 max-w-3xl">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Learning objectives
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
                {guide.learningObjectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {guide.prerequisites.length > 0 ? (
            <section className="mt-8 max-w-3xl">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Prerequisites
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
                {guide.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-8 max-w-3xl rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Progress tracking placeholder — completion lands with learner
            accounts, not MES-026.
          </div>

          <section className="mt-10 max-w-3xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-foreground">
              Outline
            </h2>
            <div className="mt-6 space-y-6">
              {guide.sections.map((section, si) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold text-foreground">
                    {si + 1}. {section.title}
                  </h3>
                  {section.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  ) : null}
                  <ol className="mt-3 space-y-2">
                    {section.lessons.map((lesson, li) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/guides/${guide.slug}/lessons/${lesson.slug}`}
                          className="flex items-baseline justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
                        >
                          <span className="font-medium text-foreground">
                            {si + 1}.{li + 1} {lesson.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {lesson.readingTimeMin} min
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            {firstLesson ? (
              <Button asChild size="lg">
                <Link
                  href={`/guides/${guide.slug}/lessons/${firstLesson.slug}`}
                >
                  Start learning
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="lg">
              <Link href="/guides">All guides</Link>
            </Button>
          </div>

          <div className="mt-12 max-w-3xl">
            <AskContextualWidget
              contextType="GUIDE"
              contextId={guide.id}
              contextTitle={guide.title}
              contextExcerpt={guide.shortDescription}
              suggestions={[
                "What will I learn in this guide?",
                "Explain the first concept",
                "Who is this guide for?",
              ]}
            />
          </div>
        </div>

        <div className="min-w-0">
          <GuideResourcePanel items={related} />
        </div>
      </div>
    </>
  );
}
