import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { SEEDED_HOMEPAGE_CONTENT } from "@/features/homepage-public/constants/seed";
import {
  getHomepageStatistics,
  snapshotToStatItems,
} from "@/services/homepage";

export async function GET() {
  try {
    const snapshot = await getHomepageStatistics();
    const items = snapshotToStatItems(
      SEEDED_HOMEPAGE_CONTENT.stats,
      snapshot,
    );

    const res = ok(
      {
        available: snapshot.available,
        generatedAt: snapshot.generatedAt,
        raw: snapshot.raw,
        values: snapshot.values,
        items,
      },
      { source: snapshot.available ? "database" : "fallback" },
    );

    res.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
