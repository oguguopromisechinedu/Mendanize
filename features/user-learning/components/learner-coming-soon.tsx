import type { Metadata } from "next";
import Link from "next/link";

import {
  MendanizeRobot,
  RobotSpeechBubble,
} from "@/components/brand/MendanizeRobot";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false },
};

export function LearnerComingSoon({
  title,
  description,
  celebrate = false,
}: {
  title: string;
  description: string;
  celebrate?: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <MendanizeRobot
        variant={celebrate ? "celebrate" : "empty"}
        className="mb-6 h-36 w-32"
      />
      <RobotSpeechBubble className="mb-6 max-w-md text-sm">
        {description}
      </RobotSpeechBubble>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-muted-foreground">
        This space is part of the Mendanize learner ecosystem. AI features use
        platform-managed keys on the server — nothing sensitive lives in your
        browser.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/account">Back to home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/ask">Open AI Tutor</Link>
        </Button>
      </div>
    </div>
  );
}
