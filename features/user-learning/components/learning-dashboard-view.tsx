import Link from "next/link";

import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/features/admin-dashboard";
import { RecommendationsRail } from "@/features/recommendations";
import { Button } from "@/components/ui/button";
import type { LearningDashboard } from "@/services/learning";
import { LearningNav } from "./learning-nav";

export function LearningDashboardView({ data }: { data: LearningDashboard }) {
  const welcome = data.userName ? `Welcome back, ${data.userName}` : "My Learning";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={welcome}
        description="Your personalized learning space — continue guides, saved resources, and recommendations."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/account/interests">Edit interests</Link>
          </Button>
        }
      />
      <LearningNav />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Saved" value={String(data.stats.savedCount)} />
        <AdminStatCard label="History" value={String(data.stats.historyCount)} />
        <AdminStatCard label="Interests" value={String(data.stats.interestCount)} />
        <AdminStatCard
          label="Streak"
          value={`${data.stats.streakDaysPlaceholder}d`}
          hint={data.stats.weeklyGoalPlaceholder}
        />
      </div>

      <AdminPanel
        title="Continue learning"
        action={
          <Button asChild size="sm" variant="ghost">
            <Link href="/account/continue">View all</Link>
          </Button>
        }
      >
        {data.continueLearning.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No guide progress yet. Open a Learning Guide to begin.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.continueLearning.map((card) => (
              <li
                key={card.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{card.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {card.lastLessonTitle} · {card.remainingLessons} left ·{" "}
                    {card.percentComplete}%
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={card.href}>Resume</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel
          title="Recently viewed"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link href="/account/history">History</Link>
            </Button>
          }
        >
          {data.recentlyViewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing viewed yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.recentlyViewed.map((item) => (
                <li key={item.id}>
                  <Link className="text-primary hover:underline" href={item.href}>
                    {item.title}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.entityType}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Saved"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link href="/account/saved">All saved</Link>
            </Button>
          }
        >
          {data.savedPreview.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Save articles, guides, or tools to revisit them here.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.savedPreview.map((item) => (
                <li key={item.id}>
                  <Link className="text-primary hover:underline" href={item.href}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <RecommendationsRail
        title="Recommended for you"
        items={data.recommendations}
        emptyMessage="Pick interests to personalize recommendations — trending fills the gap when cold."
      />
    </div>
  );
}
