import type { Metadata } from "next";

import { LearnerComingSoon } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "AI Tools Marketplace",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="AI Tools Marketplace"
      description="Buy and sell AI tools here soon. Until then, explore Admin-published tools in AI Tools."
    />
  );
}
