import type { Metadata } from "next";
import { LearnerComingSoon } from "@/features/user-learning/components/learner-coming-soon";

export const metadata: Metadata = {
  title: "Coding workspace",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Coding workspace"
      description="I’m preparing a focused practice space tied to your guides. Until then, keep learning — I’ll meet you in the AI Tutor."
    />
  );
}
