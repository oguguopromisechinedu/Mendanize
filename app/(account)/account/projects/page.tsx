import type { Metadata } from "next";
import { LearnerComingSoon } from "@/features/user-learning/components/learner-coming-soon";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Projects"
      description="Build what you learn in project tracks. I’ll celebrate your first ship with a certificate tip when this lands."
    />
  );
}
