"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/design";

const goals = [
  "Content creation",
  "Marketing & SEO",
  "Business strategy",
  "Team collaboration",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const finish = () => {
    router.push(routes.dashboard);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-lg space-y-8">
        <Logo className="justify-center" href={routes.home} />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Step 1 of 1
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Personalize your workspace
          </h1>
          <p className="mt-2 text-slate-400">
            Tell us a bit about you so Mendanize can tailor your experience.
          </p>
        </div>

        <div>
          <label htmlFor="company" className="mb-1 block text-sm text-slate-300">
            Company or brand (optional)
          </label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
            className="border-white/10 bg-white/5 text-white"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">
            What are your main goals?
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedGoals.includes(goal)
                    ? "border-violet-400 bg-violet-500/20 text-white"
                    : "border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={finish} className="w-full rounded-full">
          Enter dashboard →
        </Button>
      </div>
    </div>
  );
}
