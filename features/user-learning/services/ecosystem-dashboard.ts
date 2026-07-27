import { getLatestCareerReadiness } from "@/services/growth";
import {
  listApprovedListings,
  listOpenJobs,
  type JobPostingRecord,
  type MarketplaceListingRecord,
} from "@/services/marketplace";

export type LearnerEcosystemSnapshot = {
  openJobs: JobPostingRecord[];
  marketplaceListings: MarketplaceListingRecord[];
  careerReadiness: {
    score: number;
    gaps: string[];
  };
};

const DASHBOARD_JOB_LIMIT = 6;
const DASHBOARD_LISTING_LIMIT = 6;

export async function loadLearnerEcosystemExtras(
  userId: string,
): Promise<LearnerEcosystemSnapshot> {
  const [openJobs, marketplaceListings, careerReadiness] = await Promise.all([
    listOpenJobs(),
    listApprovedListings(),
    getLatestCareerReadiness(userId),
  ]);

  return {
    openJobs: openJobs.slice(0, DASHBOARD_JOB_LIMIT),
    marketplaceListings: marketplaceListings.slice(0, DASHBOARD_LISTING_LIMIT),
    careerReadiness: {
      score: careerReadiness.score,
      gaps: careerReadiness.gaps ?? [],
    },
  };
}
