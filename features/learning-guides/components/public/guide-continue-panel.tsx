import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AskContextualWidget } from "@/features/ask-mendanize";
import { RecommendationsRail } from "@/features/recommendations";
import type { RecommendationItem } from "@/services/recommendations";

export function GuideContinuePanel({
  guideSlug,
  nextLesson,
  guideId,
  lessonTitle,
  lessonExcerpt,
  related,
}: {
  guideSlug: string;
  nextLesson: { slug: string; title: string } | null;
  guideId: string;
  lessonTitle: string;
  lessonExcerpt?: string | null;
  related: RecommendationItem[];
}) {
  return (
    <div className="mt-12 space-y-10 border-t border-border pt-10">
      {nextLesson ? (
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Continue learning
          </p>
          <p className="mt-2 text-lg font-medium text-foreground">
            {nextLesson.title}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/guides/${guideSlug}/lessons/${nextLesson.slug}`}>
              Next lesson
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Continue learning
          </p>
          <p className="mt-2 text-foreground">You&apos;ve reached the last lesson.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/guides/${guideSlug}`}>Back to guide overview</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides">Browse more guides</Link>
            </Button>
          </div>
        </div>
      )}

      <AskContextualWidget
        contextType="GUIDE"
        contextId={guideId}
        contextTitle={lessonTitle}
        contextExcerpt={lessonExcerpt}
        suggestions={[
          "Ask about this lesson",
          "Explain this concept",
          "Summarize this lesson",
        ]}
      />

      <RecommendationsRail title="Suggested next" items={related} />
    </div>
  );
}
