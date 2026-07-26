import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  Flame,
  Store,
  Users,
  Wrench,
} from "lucide-react";

import {
  MendanizeRobot,
  RobotSpeechBubble,
} from "@/components/brand/MendanizeRobot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FeaturedPublishedContent } from "@/services/content/featured-published";
import type { LearningDashboard } from "@/services/learning";
import {
  LEARNER_JOURNEY_STEPS,
  LEARNER_QUICK_ACTIONS,
} from "../constants/constants";
import { AiAssistantCard } from "./ai-assistant-card";

export type LearnerDashboardExtras = {
  planName: string;
  unreadCount: number;
  recentNotifications: Array<{
    id: string;
    title: string;
    body?: string | null;
    createdAt: string;
    link?: string | null;
  }>;
  /** Admin-flag-filtered quick actions */
  quickActions?: readonly (typeof LEARNER_QUICK_ACTIONS)[number][];
};

const TYPE_LABEL: Record<string, string> = {
  article: "Article",
  guide: "Course",
  ai_tool: "Tool",
  category: "Category",
  topic: "Topic",
};

const ACCENT_RING = [
  "from-primary/35 via-primary/5 to-transparent",
  "from-chart-2/35 via-chart-2/5 to-transparent",
  "from-chart-3/35 via-chart-3/5 to-transparent",
  "from-chart-4/35 via-chart-4/5 to-transparent",
];

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return `${Math.floor(hours / 24)}d ago`;
}

export function LearningDashboardView({
  data,
  extras,
}: {
  data: LearningDashboard;
  extras?: LearnerDashboardExtras;
}) {
  const first = data.userName?.trim().split(/\s+/)[0] || "learner";
  const planName = extras?.planName ?? "Free";
  const quickActions = extras?.quickActions ?? LEARNER_QUICK_ACTIONS;
  const streak = Math.max(data.stats.streakDays ?? 0, 0);
  const goalMinutes = Math.min(60, 15 + data.stats.continueCount * 10);
  const goalTarget = 60;
  const goalPercent = Math.min(100, Math.round((goalMinutes / goalTarget) * 100));
  const weekBars =
    data.stats.weeklyActivity?.length === 7
      ? data.stats.weeklyActivity.map((v) => Math.min(100, Math.max(12, v)))
      : [42, 58, 35, 72, 55, 88, Math.max(40, goalPercent)].map(
          (v, i) => Math.min(100, v + ((streak + i) % 3) * 4),
        );

  const tools = data.featuredFromHomepage.tools ?? [];
  const recommendedTools = data.recommendations
    .filter((r) => r.entityType === "ai_tool")
    .slice(0, 4);

  return (
    <div className="mx-auto grid max-w-[92rem] gap-6 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
      <div className="min-w-0 space-y-7">
        <WelcomeHero firstName={first} />
        <QuickActions actions={quickActions} />
        <ContinueLearningSection cards={data.continueLearning} />
        <div className="grid gap-4 lg:grid-cols-2">
          <WorkMarketplaceSoon />
          <AiToolsMarketplacePanel
            tools={tools}
            recommended={recommendedTools}
          />
        </div>
        <YourJourneyStrip />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <DailyGoalCard
          percent={goalPercent}
          minutes={goalMinutes}
          target={goalTarget}
          weekBars={weekBars}
        />
        <StreakCard days={streak} />
        <CareerReadinessSoon />
        <RecentActivity
          history={data.recentlyViewed}
          notifications={extras?.recentNotifications ?? []}
          continueCards={data.continueLearning}
        />
        <CommunityHighlights />
        <SubscriptionStatus planName={planName} />
        <AiAssistantCard userName={data.userName} />
      </aside>
    </div>
  );
}

function WelcomeHero({ firstName }: { firstName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-gradient-to-br from-surface via-card to-background p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-chart-2/15 blur-3xl"
      />

      <div className="relative mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back,{" "}
          <span className="text-primary">{firstName}</span>
          <span className="ml-2 inline-block" aria-hidden>
            👋
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-foreground/80 sm:text-base">
          Learn. Build. Collaborate. Earn.
        </p>
      </div>

      <div className="relative grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/50 p-5 backdrop-blur-sm sm:p-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MendanizeRobot variant="avatar" className="h-10 w-9" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Mendanize AI
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground sm:text-2xl">
              Your AI-powered journey starts here.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Courses, projects, community, and career growth — shaped by what
              you learn next.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/ask">
                Ask Mendanize AI
                <span aria-hidden>→</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/account/guides">Browse courses</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-background p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(232,148,12,0.22),transparent_55%)]" />
          <div className="relative flex flex-col items-center">
            <MendanizeRobot
              variant="hero"
              className="h-40 w-36 drop-shadow-[0_12px_40px_rgba(232,148,12,0.35)] sm:h-48 sm:w-44"
            />
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {["Learn", "Build", "Earn"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur"
                >
                  {label}
                </span>
              ))}
            </div>
            <RobotSpeechBubble className="mt-3 max-w-[15rem] text-center text-xs">
              Ready when you are — pick a path or ask me anything.
            </RobotSpeechBubble>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions({
  actions,
}: {
  actions: readonly (typeof LEARNER_QUICK_ACTIONS)[number][];
}) {
  return (
    <section>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {actions.map((action) => {
          const Icon = action.icon;
          const soon = "soon" in action && action.soon;
          return (
            <li key={action.href + action.label}>
              <Link
                href={action.href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-card/80 px-3.5 py-3 transition duration-[var(--motion-base)] hover:-translate-y-0.5 hover:border-primary/40 hover:bg-hover hover:shadow-glow"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {action.label}
                    </span>
                    {soon ? (
                      <span className="rounded bg-primary/15 px-1 text-[9px] font-bold uppercase text-primary">
                        New
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ContinueLearningSection({
  cards,
}: {
  cards: LearningDashboard["continueLearning"];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          Continue Learning
        </h2>
        <Button asChild size="sm" variant="ghost" className="text-primary">
          <Link href="/account/continue">View all</Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <EmptyPanel
          title="No courses in progress yet"
          body="Start a guide and I’ll keep your place marked here."
          href="/account/guides"
          cta="Browse courses"
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 4).map((card, index) => {
            const started = card.percentComplete > 0;
            return (
              <li key={card.id}>
                <Link
                  href={card.href}
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:border-primary/45 hover:shadow-glow"
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
                      ACCENT_RING[index % ACCENT_RING.length],
                    )}
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-background/80 text-primary ring-1 ring-border">
                      <BookOpen className="size-5" aria-hidden />
                    </span>
                    <Badge variant={started ? "secondary" : "outline"}>
                      {started ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                  <h3 className="relative mt-3 line-clamp-2 text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="relative mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {card.lastLessonTitle}
                  </p>
                  <div className="relative mt-auto space-y-2 pt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {card.completedLessons} of {card.totalLessons} lessons
                      </span>
                      <span className="font-semibold text-foreground">
                        {card.percentComplete}%
                      </span>
                    </div>
                    <Progress value={card.percentComplete} className="h-2" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function WorkMarketplaceSoon() {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Work Marketplace
        </h2>
        <Badge variant="outline">Soon</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Freelance and job listings will appear here once the marketplace ships.
        No placeholder jobs.
      </p>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <BriefcaseBusiness className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Coming soon</p>
          <p className="text-xs text-muted-foreground">
            Full-time · Part-time · Freelance filters
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <Link href="/account/work">Open</Link>
        </Button>
      </div>
    </section>
  );
}

function AiToolsMarketplacePanel({
  tools,
  recommended,
}: {
  tools: FeaturedPublishedContent["tools"];
  recommended: LearningDashboard["recommendations"];
}) {
  const list =
    tools.length > 0
      ? tools.slice(0, 4).map((t) => ({
          id: t.id,
          title: t.name,
          description: t.description,
          href: t.href,
          meta: t.category || "AI tool",
        }))
      : recommended.map((r) => ({
          id: r.entityId,
          title: r.title,
          description: r.reason ?? "",
          href: r.href,
          meta: "Recommended",
        }));

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          AI Tools
        </h2>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary">
            <Link href="/account/ai-tools">Browse</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 rounded-lg text-xs">
            <Link href="/account/tools-marketplace">
              <Store className="size-3.5" aria-hidden />
              Marketplace
            </Link>
          </Button>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Published AI tools will show here. Marketplace selling is coming soon.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={t.href}
                className="flex items-start gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-border hover:bg-hover"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Wrench className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {t.title}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {t.description || t.meta}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Top-rated marketplace listings and “Sell your tool” land with the
        marketplace launch — not fabricated here.
      </p>
    </section>
  );
}

function YourJourneyStrip() {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          Your Journey
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete path to learn, build, earn and grow.
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {LEARNER_JOURNEY_STEPS.map((step) => (
          <li key={step.step}>
            <Link
              href={step.href}
              className="group flex h-full flex-col rounded-2xl border border-border bg-background/60 p-3.5 transition hover:border-primary/40 hover:shadow-glow"
            >
              <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-500 text-sm font-bold text-primary-foreground shadow-glow">
                {step.step}
              </span>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                {step.title}
              </span>
              <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {step.description}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DailyGoalCard({
  percent,
  minutes,
  target,
  weekBars,
}: {
  percent: number;
  minutes: number;
  target: number;
  weekBars: number[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Daily Goal</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {minutes}/{target} mins today
          </p>
        </div>
        <span className="text-sm font-bold text-primary">{percent}%</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative flex size-[4.75rem] shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${percent}%, color-mix(in oklab, var(--muted) 75%, transparent) 0)`,
          }}
        >
          <div className="flex size-[3.5rem] flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="text-sm font-bold text-foreground">{percent}%</span>
          </div>
        </div>
        <div className="flex h-16 flex-1 items-end gap-1">
          {weekBars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-gradient-to-t from-primary/50 to-primary"
                style={{ height: `${Math.max(14, h)}%` }}
              />
              <span className="text-[9px] text-muted-foreground">
                {"MTWRFSS"[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StreakCard({ days }: { days: number }) {
  const active = Math.min(7, Math.max(days > 0 ? days : 0, 0));
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Current Streak</h3>
        <span className="text-sm font-bold text-primary">{days} Days</span>
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              i < active
                ? "bg-primary/20 text-primary ring-1 ring-primary/45"
                : "bg-muted/50 text-muted-foreground/50",
            )}
            aria-hidden
          >
            <Flame className="size-3.5" />
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Keep a steady learning rhythm — streaks use your real activity.
      </p>
    </section>
  );
}

function CareerReadinessSoon() {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Career Readiness
        </h3>
        <Badge variant="outline">Soon</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        A real readiness score lands with Career Hub — no fabricated %.
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <li>• Complete more projects</li>
        <li>• Earn certificates from guides</li>
        <li>• Build your community profile</li>
      </ul>
      <Button asChild size="sm" variant="outline" className="mt-3 w-full rounded-xl">
        <Link href="/account/career">View Career Hub</Link>
      </Button>
    </section>
  );
}

function CommunityHighlights() {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Community Highlights
        </h3>
        <Users className="size-4 text-primary" aria-hidden />
      </div>
      <ul className="space-y-2 text-sm">
        <li>
          <Link
            href="/community/discussions"
            className="text-foreground hover:text-primary"
          >
            Ask the Community
          </Link>
        </li>
        <li>
          <Link
            href="/community/groups"
            className="text-foreground hover:text-primary"
          >
            Study Groups
          </Link>
        </li>
        <li>
          <Link
            href="/community/projects"
            className="text-foreground hover:text-primary"
          >
            Project Showcase
          </Link>
        </li>
        <li>
          <Link
            href="/community/guidelines"
            className="text-muted-foreground hover:text-primary"
          >
            Guidelines
          </Link>
        </li>
      </ul>
    </section>
  );
}

function SubscriptionStatus({ planName }: { planName: string }) {
  const free =
    planName.toLowerCase() === "free" || planName.toLowerCase() === "starter";
  return (
    <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 via-card to-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Subscription
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{planName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {free
          ? "Upgrade for higher Ask volume and certificate tracks."
          : "Thanks for supporting Mendanize — enjoy expanded AI capacity."}
      </p>
      <Button
        asChild
        size="sm"
        className="mt-3 w-full rounded-xl"
        variant={free ? "default" : "outline"}
      >
        <Link href="/account/billing">
          {free ? "Upgrade Now" : "Manage billing"}
        </Link>
      </Button>
    </section>
  );
}

function RecentActivity({
  history,
  notifications,
  continueCards,
}: {
  history: LearningDashboard["recentlyViewed"];
  notifications: LearnerDashboardExtras["recentNotifications"];
  continueCards: LearningDashboard["continueLearning"];
}) {
  const fallback = continueCards.slice(0, 3).map((c, i) => ({
    id: `c-${c.id}`,
    title: `Continued “${c.title}”`,
    meta: i === 0 ? "Recently" : "Earlier",
    href: c.href,
  }));

  const items = [
    ...notifications.slice(0, 2).map((n) => ({
      id: `n-${n.id}`,
      title: n.title,
      meta: formatRelative(n.createdAt),
      href: n.link || "/account/notifications",
    })),
    ...history.slice(0, 3).map((h) => ({
      id: h.id,
      title: h.title,
      meta: `${TYPE_LABEL[h.entityType] ?? h.entityType} · ${formatRelative(h.viewedAt)}`,
      href: h.href,
    })),
  ];

  const feed = items.length ? items.slice(0, 5) : fallback;

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
          <Link href="/account/history">History</Link>
        </Button>
      </div>
      {feed.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Lessons, saves, and wins will show up here.
        </p>
      ) : (
        <ul className="space-y-3">
          {feed.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-lg transition hover:bg-hover"
              >
                <p className="truncate text-sm text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyPanel({
  title,
  body,
  href,
  cta,
  variant = "empty",
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  variant?: "empty" | "tip";
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-surface/40 p-6 sm:flex-row sm:items-center">
      <MendanizeRobot variant={variant} className="h-20 w-16" />
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <Button asChild className="rounded-xl">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
