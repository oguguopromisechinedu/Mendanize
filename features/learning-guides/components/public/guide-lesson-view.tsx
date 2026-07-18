import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prepareArticleHtml } from "@/features/articles";
import type {
  GuideLessonRecord,
  GuideRecord,
} from "@/services/content";
import type { RecommendationItem } from "@/services/recommendations";
import { GuideContinuePanel } from "./guide-continue-panel";
import { GuideLessonNav } from "./guide-lesson-nav";
import { GuideResourcePanel } from "./guide-resource-panel";

export function GuideLessonView({
  guide,
  lesson,
  prev,
  next,
  related,
  structuredData,
  breadcrumbJsonLd,
}: {
  guide: GuideRecord;
  lesson: GuideLessonRecord;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  related: RecommendationItem[];
  structuredData?: Record<string, unknown> | null;
  breadcrumbJsonLd?: Record<string, unknown> | null;
}) {
  const { html } = prepareArticleHtml(lesson.content || "");
  const excerpt =
    lesson.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) ||
    null;

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

      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]">
        <aside className="min-w-0 max-lg:hidden">
          <div className="sticky top-24">
            <p className="mb-2 text-xs text-muted-foreground">
              <Link
                href={`/guides/${guide.slug}`}
                className="hover:text-foreground hover:underline"
              >
                {guide.title}
              </Link>
            </p>
            <GuideLessonNav guide={guide} currentLessonSlug={lesson.slug} />
          </div>
        </aside>

        <div className="min-w-0">
          <details className="mb-6 rounded-lg border border-border p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">
              Lesson navigation
            </summary>
            <div className="mt-3">
              <GuideLessonNav guide={guide} currentLessonSlug={lesson.slug} />
            </div>
          </details>

          <header className="max-w-3xl">
            <p className="text-sm text-muted-foreground">
              <Link
                href={`/guides/${guide.slug}`}
                className="text-primary hover:underline"
              >
                {guide.title}
              </Link>
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground md:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lesson.readingTimeMin} min read · Completion placeholder
            </p>
          </header>

          {lesson.featuredImageUrl ? (
            <div className="relative mt-6 aspect-[21/9] max-w-3xl overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lesson.featuredImageUrl}
                alt={lesson.featuredImageAlt || lesson.title}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}

          {lesson.videoUrl ? (
            <div className="mt-6 max-w-3xl rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              Video placeholder: {lesson.videoUrl}
            </div>
          ) : null}

          <div
            className="prose prose-neutral mt-8 max-w-[42rem] dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:rounded-lg prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {lesson.codeExample ? (
            <pre className="mt-8 max-w-3xl overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <code>{lesson.codeExample}</code>
            </pre>
          ) : null}

          {lesson.resourceUrl ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Resource placeholder:{" "}
              <span className="text-foreground">{lesson.resourceUrl}</span>
            </p>
          ) : null}

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/guides/${guide.slug}/lessons/${prev.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="mt-1 font-medium text-foreground">{prev.title}</p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/guides/${guide.slug}/lessons/${next.slug}`}
                className="rounded-lg border border-border p-4 text-right transition-colors hover:border-primary/40 sm:justify-self-end"
              >
                <p className="text-xs text-muted-foreground">Next</p>
                <p className="mt-1 font-medium text-foreground">{next.title}</p>
              </Link>
            ) : (
              <Button asChild variant="outline" className="justify-self-end">
                <Link href={`/guides/${guide.slug}`}>Guide overview</Link>
              </Button>
            )}
          </div>

          <GuideContinuePanel
            guideSlug={guide.slug}
            nextLesson={next}
            guideId={guide.id}
            lessonTitle={lesson.title}
            lessonExcerpt={excerpt}
            related={related}
          />
        </div>

        <aside className="min-w-0 max-lg:order-last">
          <div className="sticky top-24">
            <GuideResourcePanel items={related} />
          </div>
        </aside>
      </div>
    </>
  );
}
