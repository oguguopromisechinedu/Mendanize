import type { Metadata } from "next";
import { LearnerComingSoon } from "@/features/user-learning/components/learner-coming-soon";

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Certificates"
      description="When you complete a path, I’ll congratulate you here with your certificate. Keep stacking lessons — you’re closer than you think."
      celebrate
    />
  );
}
