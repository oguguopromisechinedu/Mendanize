import { RecommendationsRail } from "@/features/recommendations";
import type { RecommendationItem } from "@/services/recommendations";

/** Related learning + placeholders for external refs / downloads (MES-026). */
export function GuideResourcePanel({
  items,
}: {
  items: RecommendationItem[];
}) {
  return (
    <aside className="space-y-6">
      <RecommendationsRail title="Related resources" items={items} />
      <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">External references</p>
        <p className="mt-1">
          Downloads and external links will appear here — placeholder for now.
        </p>
      </div>
    </aside>
  );
}
