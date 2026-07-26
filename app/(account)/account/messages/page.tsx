import type { Metadata } from "next";

import { LearnerComingSoon } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
};

export default function Page() {
  return (
    <LearnerComingSoon
      title="Messages"
      description="Direct messaging isn’t built yet. Use Community discussions and Notifications for updates."
    />
  );
}
