import { AdminPageHeader } from "@/features/admin-dashboard";
import { RecommendationsRail } from "@/features/recommendations";
import type { RecommendationItem } from "@/services/recommendations";
import { LearningNav } from "./learning-nav";

export function RecommendedView({ items }: { items: RecommendationItem[] }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Recommended for you"
        description="Powered by the Recommendations Service (MES-018) with contextType: user."
      />
      <LearningNav />
      <RecommendationsRail
        title="Personalized picks"
        items={items}
        emptyMessage="Add interests to improve recommendations."
      />
    </div>
  );
}
