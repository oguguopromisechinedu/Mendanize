import type { Metadata } from "next";

import { requirePublicUser } from "@/features/authentication/server";
import {
  LearningDashboardView,
  loadLearningDashboard,
} from "@/features/user-learning";

export const metadata: Metadata = {
  title: "My Learning",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  const data = await loadLearningDashboard(
    session!.user.id,
    session!.user.name,
  );
  return <LearningDashboardView data={data} />;
}
