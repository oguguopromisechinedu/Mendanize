import type { Metadata } from "next";
import { LearnerComingSoon } from "@/features/user-learning/components/learner-coming-soon";

export const metadata: Metadata = {
  title: "Notes",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Notes"
      description="Capture learning notes alongside your guides and projects. Until this space ships, jot ideas in AI Tutor and I’ll help you organize them."
    />
  );
}
