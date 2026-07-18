import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { GuideSummary } from "@/services/content";
import { GUIDE_DIFFICULTY_LABELS } from "../../constants/constants";

export function PublicGuideListView({ guides }: { guides: GuideSummary[] }) {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-10 max-w-2xl">
        <p className="type-caption text-primary">Guides</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          Structured learning paths
        </h1>
        <p className="mt-3 text-muted-foreground">
          Step-by-step educational journeys — sections, lessons, and a clear
          path from start to finish.
        </p>
      </header>

      {guides.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published guides yet. Check back soon.
        </p>
      ) : (
        <ul className="space-y-8">
          {guides.map((guide) => (
            <li key={guide.id}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted">
                  {guide.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guide.coverImageUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {guide.categoryName ? (
                      <span>{guide.categoryName}</span>
                    ) : null}
                    {guide.difficulty ? (
                      <span>
                        {GUIDE_DIFFICULTY_LABELS[guide.difficulty]}
                      </span>
                    ) : null}
                    {guide.featured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : null}
                    {guide.estimatedMinutes ? (
                      <span>{guide.estimatedMinutes} min</span>
                    ) : null}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-foreground group-hover:text-primary">
                    {guide.title}
                  </h2>
                  {guide.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {guide.excerpt}
                    </p>
                  ) : null}
                  {guide.sectionCount != null || guide.lessonCount != null ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {guide.sectionCount ?? 0} sections ·{" "}
                      {guide.lessonCount ?? 0} lessons
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
