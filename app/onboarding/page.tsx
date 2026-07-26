"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Logo from "@/components/brand/Logo";
import {
  MendanizeRobot,
  RobotSpeechBubble,
} from "@/components/brand/MendanizeRobot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/design";
import { cn } from "@/lib/utils";

const goals = [
  "AI fluency",
  "Software engineering",
  "Product & strategy",
  "Content & communication",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [focus, setFocus] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const finish = () => {
    router.push(routes.account);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl"
      />

      <div className="relative w-full max-w-lg space-y-8">
        <Logo className="justify-center" href={routes.home} />

        <div className="flex flex-col items-center text-center">
          <MendanizeRobot variant="hero" className="mb-4 h-28 w-24" />
          <RobotSpeechBubble className="mb-4 max-w-sm text-sm">
            Welcome aboard — tell me what you want to learn and I’ll shape your
            dashboard around it.
          </RobotSpeechBubble>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Step 1 of 1
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
            Personalize your learning
          </h1>
          <p className="mt-2 text-muted-foreground">
            A quick setup so Mendanize AI can guide you after login.
          </p>
        </div>

        <div>
          <label htmlFor="focus" className="mb-1 block text-sm text-muted-foreground">
            What are you focusing on? (optional)
          </label>
          <Input
            id="focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Prompt engineering for product teams"
            className="rounded-xl"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Main learning goals
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm transition",
                  selectedGoals.includes(goal)
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={finish} className="w-full rounded-xl" size="lg">
          Enter my learning space →
        </Button>
      </div>
    </div>
  );
}
