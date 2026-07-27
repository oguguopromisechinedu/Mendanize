"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Code2,
  Flame,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Pencil,
  Rocket,
  Trophy,
  Users,
  Wrench,
  Zap,
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
import type {
  JobPostingRecord,
  MarketplaceListingKind,
  MarketplaceListingRecord,
} from "@/services/marketplace";
import type { RecommendationItem } from "@/services/recommendations";
import type { LearnerEcosystemSnapshot } from "../services/ecosystem-dashboard";
import { LEARNER_ICON_MAP, LEARNER_QUICK_ACTIONS } from "../constants/constants";
import { AiAssistantCard } from "./ai-assistant-card";

const MendanizeRobot3D = dynamic(
  () =>
    import("@/components/brand/MendanizeRobot3D").then(
      (m) => m.MendanizeRobot3D,
    ),
  {
    ssr: false,
    loading: () => (
      <MendanizeRobot
        variant="hero"
        className="h-40 w-36 drop-shadow-[0_12px_40px_rgba(232,148,12,0.35)] sm:h-48 sm:w-44"
      />
    ),
  },
);

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
  quickActions?: readonly (typeof LEARNER_QUICK_ACTIONS)[number][];
  ecosystem?: LearnerEcosystemSnapshot;
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

function formatJobBudget(job: JobPostingRecord) {
  if (job.budgetCents == null) return "Budget negotiable";
  return `$${(job.budgetCents / 100).toFixed(0)} ${job.currency}`;
}

function formatListingPrice(listing: MarketplaceListingRecord) {
  const amount = (listing.priceCents / 100).toFixed(
    listing.priceCents % 100 === 0 ? 0 : 2,
  );
  return listing.pricingModel === "SUBSCRIPTION"
    ? `$${amount}/mo`
    : `$${amount}`;
}

const LISTING_KIND_LABEL: Record<MarketplaceListingKind, string> = {
  AI_APP: "AI Apps",
  AGENT: "Agents",
  PROMPT_PACK: "Prompts",
  TEMPLATE: "Templates",
  AUTOMATION: "Automation",
};

function isRecentlyPublished(iso: string | null) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/* ─── Main Dashboard ─── */
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
      ? data.stats.weeklyActivity
      : [42, 58, 35, 72, 55, 88, Math.max(40, goalPercent)].map(
          (v, i) => Math.min(100, v + ((streak + i) % 3) * 4),
        );
  const ecosystem = extras?.ecosystem;
  const readinessScore = ecosystem?.careerReadiness.score ?? 0;
  const readinessGaps = ecosystem?.careerReadiness.gaps ?? [];

  return (
    <div className="mx-auto max-w-[96rem] space-y-6">
      {/* Hero + Top Sidebar Row */}
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <WelcomeHero firstName={first} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <DailyGoalCard
            percent={goalPercent}
            minutes={goalMinutes}
            target={goalTarget}
            weekBars={weekBars}
          />
          <StreakCard days={streak} />
          <CareerReadinessCard score={readinessScore} gaps={readinessGaps} />
        </div>
      </div>

      {/* Quick Navigation Row */}
      <QuickActions actions={quickActions} />

      {/* Continue Learning */}
      <ContinueLearningSection cards={data.continueLearning} />

      {/* Middle Grid: Recent Activity + Community Highlights */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <RecentActivity
          history={data.recentlyViewed}
          notifications={extras?.recentNotifications ?? []}
          continueCards={data.continueLearning}
        />
        <CommunityHighlightsCard />
      </div>

      {/* Work Marketplace + AI Tools Marketplace */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkMarketplaceSection jobs={ecosystem?.openJobs ?? []} />
        <AiToolsMarketplaceSection listings={ecosystem?.marketplaceListings ?? []} />
      </div>

      {/* Top Rated Tools + AI Assistant */}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <TopRatedToolsSection listings={ecosystem?.marketplaceListings ?? []} />
        <AiAssistantCard userName={data.userName} />
      </div>

      {/* Featured from Homepage */}
      <FeaturedFromHomepageSection featured={data.featuredFromHomepage} />

      {/* Recommended */}
      <RecommendedSection items={data.recommendations} />

      {/* Your Journey Roadmap */}
      <JourneyRoadmap />

      {/* Subscription CTA */}
      <SubscriptionStatus planName={planName} />
    </div>
  );
}

/* ─── Hero with 3D Robot ─── */
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

      <div className="relative mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back,{" "}
          <span className="text-primary">{firstName}</span>
          <span className="ml-2 inline-block" aria-hidden>
            👋
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn. Build. Collaborate. Earn.
        </p>
      </div>

      <div className="relative grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/50 p-5 backdrop-blur-sm sm:p-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground sm:text-2xl">
              Your AI-powered journey starts here
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get personalized recommendations, achieve your goals, and grow
              your skills.
            </p>
          </div>
          <div className="mt-5 grid max-w-md grid-cols-2 gap-2.5">
            <Button asChild size="lg" className="w-full rounded-xl shadow-glow">
              <Link href="/ask">
                <Zap className="mr-1.5 size-4" aria-hidden />
                Ask Mendanize AI
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-xl">
              <Link href="/account/guides">Browse courses</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-[16rem] items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(232,148,12,0.22),transparent_55%)]" />
          <MendanizeRobot3D className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}

/* ─── Quick Navigation Row ─── */
function QuickActions({
  actions,
}: {
  actions: readonly (typeof LEARNER_QUICK_ACTIONS)[number][];
}) {
  return (
    <section>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {actions.map((action) => {
          const Icon = LEARNER_ICON_MAP[action.icon];
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
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {action.label}
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

/* ─── Continue Learning ─── */
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
          body="Start a guide and your progress will show up here."
          href="/account/guides"
          cta="Browse courses"
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 4).map((card, index) => {
            const started = card.percentComplete > 0;
            const CARD_ICONS = [BookOpen, Code2, Wrench, Lightbulb];
            const CardIcon = CARD_ICONS[index % CARD_ICONS.length];
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
                      <CardIcon className="size-5" aria-hidden />
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

/* ─── Daily Goal ─── */
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
          <p className="mt-0.5 text-[11px] text-muted-foreground">Edit</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative flex size-[4.75rem] shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${percent}%, color-mix(in oklab, var(--muted) 75%, transparent) 0)`,
          }}
        >
          <div className="flex size-[3.5rem] flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="text-lg font-bold text-primary">{percent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground">
            <span className="text-lg font-bold">{minutes}</span>
            <span className="text-muted-foreground"> / {target} mins</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Keep it up! 🔥
          </p>
          <p className="text-[10px] text-muted-foreground">
            You&apos;re doing great today!
          </p>
        </div>
      </div>
      <div className="mt-3 flex h-12 items-end gap-1">
        {weekBars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-primary/50 to-primary"
              style={{ height: `${Math.max(14, h)}%` }}
            />
            <span className="text-[9px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Current Streak ─── */
function StreakCard({ days }: { days: number }) {
  const active = Math.min(7, Math.max(1, days));
  const bestStreak = Math.max(days, 14);
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Current Streak</h3>
        <div className="text-right">
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <Flame className="size-3.5" aria-hidden />
            {days} Days
          </span>
          <span className="text-[10px] text-muted-foreground">
            Best: {bestStreak} days
          </span>
        </div>
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
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
            <span className="text-[9px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Career Readiness ─── */
function CareerReadinessCard({
  score,
  gaps,
}: {
  score: number;
  gaps: string[];
}) {
  const displayGaps =
    gaps.length > 0
      ? gaps.slice(0, 3)
      : score > 0
        ? ["Keep building — recalculate in Career Hub for fresh gaps."]
        : [
            "Complete guides and assessments",
            "Publish showcase projects",
            "Build your career profile",
          ];

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Career Readiness
        </h3>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[10px] text-primary"
        >
          <Link href="/account/career">View Career Hub</Link>
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative flex size-16 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--success) ${score}%, color-mix(in oklab, var(--muted) 75%, transparent) 0)`,
          }}
        >
          <div className="flex size-11 flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="text-sm font-bold text-foreground">{score}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-xs">
          <p className="text-muted-foreground">
            {score > 0 ? "You're on track!" : "Start your career journey"}
          </p>
          {displayGaps.map((gap) => (
            <div key={gap} className="flex items-center gap-1.5">
              <CheckCircle className="size-3 text-success" />
              <span className="text-muted-foreground">{gap}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Recent Activity ─── */
function RecentActivity({
  history,
  notifications,
  continueCards,
}: {
  history: LearningDashboard["recentlyViewed"];
  notifications: LearnerDashboardExtras["recentNotifications"];
  continueCards: LearningDashboard["continueLearning"];
}) {
  const fallback = continueCards.slice(0, 4).map((c, i) => ({
    id: `c-${c.id}`,
    title: `Continued "${c.title}"`,
    meta: i === 0 ? "2 hours ago" : i === 1 ? "5 hours ago" : "Yesterday",
    href: c.href,
    icon: i === 0 ? "completed" : i === 1 ? "saved" : i === 2 ? "started" : "badge",
  }));

  const items = [
    ...notifications.slice(0, 2).map((n) => ({
      id: `n-${n.id}`,
      title: n.title,
      meta: formatRelative(n.createdAt),
      href: n.link || "/account/notifications",
      icon: "notification" as const,
    })),
    ...history.slice(0, 4).map((h) => ({
      id: h.id,
      title: h.title,
      meta: `${TYPE_LABEL[h.entityType] ?? h.entityType} · ${formatRelative(h.viewedAt)}`,
      href: h.href,
      icon: "viewed" as const,
    })),
  ];

  const feed = items.length ? items.slice(0, 5) : fallback;

  const ICON_MAP: Record<string, typeof CheckCircle> = {
    completed: CheckCircle,
    saved: BookOpen,
    started: Rocket,
    badge: Trophy,
    notification: MessageSquare,
    viewed: BookOpen,
  };

  const COLOR_MAP: Record<string, string> = {
    completed: "text-success",
    saved: "text-chart-2",
    started: "text-primary",
    badge: "text-chart-4",
    notification: "text-chart-3",
    viewed: "text-muted-foreground",
  };

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary">
          <Link href="/account/history">View all</Link>
        </Button>
      </div>
      <ul className="space-y-3">
        {feed.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? BookOpen;
          const color = COLOR_MAP[item.icon] ?? "text-muted-foreground";
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start gap-3 rounded-lg p-1.5 transition hover:bg-hover"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/50",
                    color,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─── Community Highlights ─── */
function CommunityHighlightsCard() {
  const links = [
    {
      icon: Users,
      label: "Ask the Community",
      desc: "Get help from fellow learners",
      href: "/community",
    },
    {
      icon: Users,
      label: "Study Groups",
      desc: "Join or create a study group",
      href: "/community/groups",
    },
    {
      icon: Rocket,
      label: "Project Showcase",
      desc: "Show off your projects",
      href: "/community/projects",
    },
    {
      icon: GraduationCap,
      label: "Upcoming Events",
      desc: "Join webinars & challenges",
      href: "/community/discussions",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Community Highlights
        </h3>
        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary">
          <Link href="/community">View all</Link>
        </Button>
      </div>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-hover"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Work Marketplace ─── */
function WorkMarketplaceSection({ jobs }: { jobs: JobPostingRecord[] }) {
  const skillTabs = Array.from(
    new Set(jobs.flatMap((job) => job.skills).filter(Boolean)),
  ).slice(0, 4);
  const tabs = ["All Jobs", ...skillTabs];
  const [activeTab, setActiveTab] = useState("All Jobs");

  const filtered =
    activeTab === "All Jobs"
      ? jobs
      : jobs.filter((job) => job.skills.includes(activeTab));

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Work Marketplace
        </h3>
        <Button asChild size="sm" variant="ghost" className="text-xs text-primary">
          <Link href="/account/work">View all jobs</Link>
        </Button>
      </div>
      {tabs.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-hover",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No open jobs yet. Check back soon or enable client posting to hire.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((job) => (
            <li key={job.id}>
              <Link
                href={`/account/work#job-${job.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition hover:border-primary/40 hover:bg-hover"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {job.title}
                    </p>
                    {isRecentlyPublished(job.publishedAt) ? (
                      <Badge className="bg-destructive/90 text-[9px]">New</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatJobBudget(job)}
                    {job.clientName ? ` · ${job.clientName}` : ""}
                  </p>
                  {job.skills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button
        asChild
        variant="outline"
        className="mt-4 w-full rounded-xl text-xs"
      >
        <Link href="/account/work">
          Browse all jobs <span aria-hidden>→</span>
        </Link>
      </Button>
    </section>
  );
}

/* ─── AI Tools Marketplace ─── */
function AiToolsMarketplaceSection({
  listings,
}: {
  listings: MarketplaceListingRecord[];
}) {
  const kindTabs = Array.from(
    new Set(listings.map((listing) => LISTING_KIND_LABEL[listing.kind])),
  );
  const tabs = ["All", ...kindTabs];
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All"
      ? listings
      : listings.filter(
          (listing) => LISTING_KIND_LABEL[listing.kind] === activeTab,
        );

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          AI Tools Marketplace
        </h3>
        <Button asChild size="sm" variant="ghost" className="text-xs text-primary">
          <Link href="/account/tools-marketplace">View all tools</Link>
        </Button>
      </div>
      {tabs.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-hover",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No approved listings yet. Creators can publish after Admin review.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((listing) => (
            <li key={listing.id}>
              <Link
                href="/account/tools-marketplace"
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition hover:border-primary/40 hover:bg-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Wrench className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {listing.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {listing.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{LISTING_KIND_LABEL[listing.kind]}</span>
                      {listing.creatorName ? (
                        <span>· {listing.creatorName}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-lg font-semibold text-primary">
                  {formatListingPrice(listing)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button
        asChild
        variant="outline"
        className="mt-4 w-full rounded-xl text-xs"
      >
        <Link href="/account/tools-marketplace">
          Explore all tools <span aria-hidden>→</span>
        </Link>
      </Button>
    </section>
  );
}

/* ─── Top Rated Tools ─── */
function TopRatedToolsSection({
  listings,
}: {
  listings: MarketplaceListingRecord[];
}) {
  const featured = listings.slice(0, 3);

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Featured Marketplace Tools
        </h3>
        <Button asChild size="sm" variant="ghost" className="text-xs text-primary">
          <Link href="/account/tools-marketplace">View all</Link>
        </Button>
      </div>
      {featured.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Approved creator tools will appear here.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {featured.map((listing) => (
            <Link
              key={listing.id}
              href="/account/tools-marketplace"
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition hover:border-primary/40 hover:bg-hover"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Wrench className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {listing.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {LISTING_KIND_LABEL[listing.kind]}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">
                {formatListingPrice(listing)}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/account/marketplace"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 p-3 text-sm text-primary transition hover:bg-primary/10"
      >
        Sell Your Tool <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

/* ─── Your Journey Roadmap ─── */
function JourneyRoadmap() {
  const steps = [
    {
      num: 1,
      icon: BookOpen,
      title: "Learn",
      desc: "Take courses and master in-demand skills.",
    },
    {
      num: 2,
      icon: Code2,
      title: "Build",
      desc: "Build projects in the coding workspace.",
    },
    {
      num: 3,
      icon: GraduationCap,
      title: "Get Certified",
      desc: "Earn certificates and verified badges.",
    },
    {
      num: 4,
      icon: Rocket,
      title: "Build Portfolio",
      desc: "Showcase your projects and skills.",
    },
    {
      num: 5,
      icon: Users,
      title: "Get Hired",
      desc: "Find work and complete real projects.",
    },
    {
      num: 6,
      icon: Trophy,
      title: "Earn & Grow",
      desc: "Build reputation and earn online income.",
    },
  ];

  return (
    <section className="rounded-[1.75rem] border border-border bg-gradient-to-r from-surface via-card to-surface p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground sm:text-2xl">
          Your Journey
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete path to learn, build, earn and grow
        </p>
      </div>

      <div className="relative flex flex-wrap items-start justify-center gap-4">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="flex flex-col items-center gap-2 text-center"
            style={{ width: "clamp(7rem, 14%, 10rem)" }}
          >
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card shadow-md">
                <step.icon className="size-7 text-primary" />
              </div>
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {step.num}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {step.title}
            </p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {step.desc}
            </p>
            {i < steps.length - 1 && (
              <div className="pointer-events-none absolute left-0 top-8 hidden w-full xl:block" aria-hidden>
                {/* connector arrows rendered via layout spacing */}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Featured from Homepage ─── */
function FeaturedFromHomepageSection({
  featured,
}: {
  featured: FeaturedPublishedContent;
}) {
  if (!featured.available) return null;

  const cards: Array<{
    key: string;
    href: string;
    title: string;
    description: string;
    badge: string;
    meta: string;
    kind: "path" | "article" | "tool";
    imageUrl?: string | null;
  }> = [
    ...featured.paths.map((p) => ({
      key: `path-${p.id}`,
      href: p.href,
      title: p.title,
      description: p.description,
      badge: "Course",
      meta: [p.difficulty, p.duration, p.lessons ? `${p.lessons} lessons` : ""]
        .filter(Boolean)
        .join(" · "),
      kind: "path" as const,
    })),
    ...featured.articles.map((a) => ({
      key: `article-${a.id}`,
      href: a.href,
      title: a.title,
      description: a.description,
      badge: a.category || "Article",
      meta: a.readingTime,
      kind: "article" as const,
      imageUrl: a.imageUrl,
    })),
    ...featured.tools.map((t) => ({
      key: `tool-${t.id}`,
      href: t.href,
      title: t.name,
      description: t.description,
      badge: t.category || "Tool",
      meta: "AI tool",
      kind: "tool" as const,
    })),
  ].slice(0, 8);

  if (cards.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          Featured on Mendanize
        </h2>
        <Button asChild size="sm" variant="ghost" className="text-primary">
          <Link href="/account/guides">Browse all</Link>
        </Button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <li key={card.key}>
            <Link
              href={card.href}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-glow"
            >
              {card.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.imageUrl}
                  alt=""
                  className="aspect-[16/10] w-full object-cover transition duration-[var(--motion-base)] group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  className={cn(
                    "flex aspect-[16/10] items-center justify-center bg-gradient-to-br",
                    ACCENT_RING[index % ACCENT_RING.length],
                  )}
                >
                  {card.kind === "tool" ? (
                    <Wrench className="size-8 text-primary/80" aria-hidden />
                  ) : card.kind === "path" ? (
                    <BookOpen className="size-8 text-primary/80" aria-hidden />
                  ) : (
                    <Pencil className="size-8 text-primary/80" aria-hidden />
                  )}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-3.5">
                <Badge variant="outline" className="w-fit">
                  {card.badge}
                </Badge>
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                  {card.title}
                </h3>
                {card.description ? (
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">
                    {card.description}
                  </p>
                ) : null}
                {card.meta ? (
                  <p className="mt-auto pt-1 text-[11px] font-medium text-muted-foreground">
                    {card.meta}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Recommended ─── */
function RecommendedSection({ items }: { items: RecommendationItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          Recommended for You
        </h2>
        <Button asChild size="sm" variant="ghost" className="text-primary">
          <Link href="/account/recommended">See more</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyPanel
          title="Recommendations will appear here"
          body="Set a few interests and we'll tailor courses, guides, and tools."
          href="/account/interests"
          cta="Pick interests"
          variant="tip"
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.slice(0, 4).map((item, index) => (
            <li key={`${item.entityType}-${item.entityId}`}>
              <Link
                href={item.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-glow"
              >
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="aspect-[16/10] w-full object-cover transition duration-[var(--motion-base)] group-hover:scale-[1.02]"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex aspect-[16/10] items-center justify-center bg-gradient-to-br",
                      ACCENT_RING[index % ACCENT_RING.length],
                    )}
                  >
                    <MendanizeRobot
                      variant="mark"
                      className="h-16 w-14 opacity-90"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  <Badge variant="outline" className="w-fit">
                    {TYPE_LABEL[item.entityType] ?? item.entityType}
                  </Badge>
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  {item.reason ? (
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                      {item.reason}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─── Subscription Status ─── */
function SubscriptionStatus({ planName }: { planName: string }) {
  const free =
    planName.toLowerCase() === "free" || planName.toLowerCase() === "starter";
  if (!free) return null;
  return (
    <section className="rounded-[1.75rem] border border-primary/25 bg-gradient-to-r from-primary/20 via-card to-primary/10 p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Upgrade to Pro
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlock all premium features, advanced AI models, and more.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/account/billing">Upgrade Now</Link>
        </Button>
      </div>
    </section>
  );
}

/* ─── Empty Panel ─── */
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
