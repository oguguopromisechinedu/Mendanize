import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getLatestCareerReadiness } from "@/services/growth";
import {
  getMarketplaceMetrics,
  listApprovedListings,
  listOpenJobs,
  type JobPostingRecord,
  type MarketplaceListingRecord,
} from "@/services/marketplace";

export type WorkMarketplaceOverviewStats = {
  activeProjects: number;
  activeProjectsTrend: string;
  openJobs: number;
  openJobsTrend: string;
  totalEarnedCents: number;
  totalEarnedTrend: string;
  proposalCount: number;
  shortlistedCount: number;
};

export type LearnerEcosystemSnapshot = {
  openJobs: JobPostingRecord[];
  recentProjects: JobPostingRecord[];
  marketplaceListings: MarketplaceListingRecord[];
  marketplaceOverview: WorkMarketplaceOverviewStats;
  careerReadiness: {
    score: number;
    gaps: string[];
  };
};

const DASHBOARD_JOB_LIMIT = 6;
const DASHBOARD_LISTING_LIMIT = 9;
const RECENT_PROJECT_LIMIT = 4;

const EMPTY_OVERVIEW: WorkMarketplaceOverviewStats = {
  activeProjects: 0,
  activeProjectsTrend: "No active contracts yet",
  openJobs: 0,
  openJobsTrend: "Check back soon",
  totalEarnedCents: 0,
  totalEarnedTrend: "Complete projects to earn",
  proposalCount: 0,
  shortlistedCount: 0,
};

async function loadMarketplaceOverview(
  userId: string,
): Promise<WorkMarketplaceOverviewStats> {
  if (!isDatabaseConfigured()) return EMPTY_OVERVIEW;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const prisma = getPrisma();
    const [
      metrics,
      activeProjects,
      activeProjectsThisWeek,
      openJobsThisWeek,
      proposalCount,
      shortlistedCount,
      earnedRows,
      earnedThisMonth,
      earnedLastMonth,
    ] = await Promise.all([
      getMarketplaceMetrics(),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.contract.count({
        where: { status: "ACTIVE", createdAt: { gte: weekAgo } },
      }),
      prisma.jobPosting.count({
        where: { status: "OPEN", publishedAt: { gte: weekAgo } },
      }),
      prisma.jobApplication.count({ where: { publicUserId: userId } }),
      prisma.jobApplication.count({
        where: { publicUserId: userId, status: "SHORTLISTED" },
      }),
      prisma.contractPayment.findMany({
        where: {
          status: { in: ["succeeded", "completed", "paid", "released"] },
          contract: { workerId: userId },
        },
        select: { amountCents: true },
      }),
      prisma.contractPayment.findMany({
        where: {
          status: { in: ["succeeded", "completed", "paid", "released"] },
          contract: { workerId: userId },
          createdAt: { gte: monthAgo },
        },
        select: { amountCents: true },
      }),
      prisma.contractPayment.findMany({
        where: {
          status: { in: ["succeeded", "completed", "paid", "released"] },
          contract: { workerId: userId },
          createdAt: { gte: new Date(monthAgo.getTime() - 30 * 86400000), lt: monthAgo },
        },
        select: { amountCents: true },
      }),
    ]);

    const totalEarnedCents = earnedRows.reduce((sum, row) => sum + row.amountCents, 0);
    const monthCents = earnedThisMonth.reduce((sum, row) => sum + row.amountCents, 0);
    const prevMonthCents = earnedLastMonth.reduce((sum, row) => sum + row.amountCents, 0);
    const earnedTrend =
      prevMonthCents > 0
        ? `${Math.round(((monthCents - prevMonthCents) / prevMonthCents) * 100)}% this month`
        : monthCents > 0
          ? "New earnings this month"
          : "Complete projects to earn";

    return {
      activeProjects,
      activeProjectsTrend:
        activeProjectsThisWeek > 0
          ? `+${activeProjectsThisWeek} this week`
          : activeProjects > 0
            ? "Active now"
            : "No active contracts yet",
      openJobs: metrics.openJobs,
      openJobsTrend:
        openJobsThisWeek > 0
          ? `+${openJobsThisWeek} this week`
          : metrics.openJobs > 0
            ? "Open for applications"
            : "Check back soon",
      totalEarnedCents,
      totalEarnedTrend: earnedTrend.startsWith("-")
        ? earnedTrend
        : monthCents > 0 && !earnedTrend.includes("%")
          ? earnedTrend
          : monthCents > 0
            ? `+${earnedTrend}`
            : earnedTrend,
      proposalCount,
      shortlistedCount,
    };
  } catch {
    return EMPTY_OVERVIEW;
  }
}

export async function loadLearnerEcosystemExtras(
  userId: string,
): Promise<LearnerEcosystemSnapshot> {
  const [openJobs, marketplaceListings, careerReadiness, marketplaceOverview] =
    await Promise.all([
      listOpenJobs(),
      listApprovedListings(),
      getLatestCareerReadiness(userId),
      loadMarketplaceOverview(userId),
    ]);

  const recentProjects = [...openJobs]
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime(),
    )
    .slice(0, RECENT_PROJECT_LIMIT);

  return {
    openJobs: openJobs.slice(0, DASHBOARD_JOB_LIMIT),
    recentProjects,
    marketplaceListings: marketplaceListings.slice(0, DASHBOARD_LISTING_LIMIT),
    marketplaceOverview,
    careerReadiness: {
      score: careerReadiness.score,
      gaps: careerReadiness.gaps ?? [],
    },
  };
}
