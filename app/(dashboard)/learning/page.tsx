import type { Metadata } from "next";

import { requireUser } from "@/features/authentication/server";
import {
  LearningDashboardView,
  loadLearningDashboard,
} from "@/features/user-learning";

export const metadata: Metadata = {
  title: "My Learning",
  robots: { index: false },
};

export default async function Page() {
  const session = await requireUser();
  const data = await loadLearningDashboard(
    session!.user.id,
    session!.user.name,
  );
  return <LearningDashboardView data={data} />;
}
