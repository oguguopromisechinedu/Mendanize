import type { Metadata } from "next";

import { LearnerComingSoon } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "Work Marketplace",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Work Marketplace"
      description="Job listings and freelance gigs will land here. No fabricated listings — this surface waits for a real product spec."
    />
  );
}
