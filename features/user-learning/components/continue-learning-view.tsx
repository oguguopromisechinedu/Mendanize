import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import type { ContinueLearningCard } from "@/services/learning";
import { LearningNav } from "./learning-nav";

export function ContinueLearningView({
  cards,
}: {
  cards: ContinueLearningCard[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Continue learning"
        description="Guide progress cards use placeholder progress until lesson completion tracking ships."
      />
      <LearningNav />
      {cards.length === 0 ? (
        <AdminPanel title="No progress yet">
          <p className="text-sm text-muted-foreground">
            Browse{" "}
            <Link className="text-primary underline" href="/guides">
              Learning Guides
            </Link>{" "}
            to get started.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <AdminPanel key={card.id} title={card.title}>
              <p className="text-sm text-muted-foreground">
                Last lesson: {card.lastLessonTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {card.completedLessons}/{card.totalLessons} lessons ·{" "}
                {card.remainingLessons} remaining
                {card.estimatedMinutesLeft != null
                  ? ` · ~${card.estimatedMinutesLeft} min left`
                  : ""}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${card.percentComplete}%` }}
                />
              </div>
              <Button asChild size="sm" className="mt-4">
                <Link href={card.href}>Resume</Link>
              </Button>
            </AdminPanel>
          ))}
        </div>
      )}
    </div>
  );
}
