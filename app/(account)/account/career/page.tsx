import type { Metadata } from "next";

import { LearnerComingSoon } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "Career Hub",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Career Hub"
      description="Career readiness tracking and hub features are coming later. Keep learning and building projects in the meantime."
    />
  );
}
