import type { Metadata } from "next";
import { LearnerComingSoon } from "@/features/user-learning/components/learner-coming-soon";

export const metadata: Metadata = {
  title: "Prompt library",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Prompt library"
      description="Reusable Mendanize prompt packs are on the way. Ask me in AI Tutor for a starter prompt anytime."
    />
  );
}
