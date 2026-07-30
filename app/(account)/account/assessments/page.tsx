import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

import { requirePublicUser } from "@/features/authentication/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listAssessmentAttemptsForUser,
  listAvailableAssessmentsForUser,
} from "@/services/growth";

export const metadata: Metadata = {
  title: "Assessments",
  robots: { index: false },
};

export default async function AssessmentsPage() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/assessments")}`);
  }

  const userId = session.user.id;
  const [available, attempts] = await Promise.all([
    listAvailableAssessmentsForUser(userId),
    listAssessmentAttemptsForUser(userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Assessments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Course assessments unlock as you progress. Passing earns certificates when
          the guide is complete.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Ready to take</h2>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assessments available yet. Continue a guide past 50% progress to unlock
            its assessment.
          </p>
        ) : (
          <ul className="space-y-3">
            {available.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/90 p-4"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.guideTitle} · {a.questionCount} questions
                  </p>
                </div>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href={a.href}>Open guide</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">History</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attempts yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border border-border">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                {a.passed ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.assessmentTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.guideTitle} · {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={a.passed ? "default" : "secondary"}>
                  {a.scorePercent}%
                </Badge>
                <Link
                  href={a.guideHref}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Guide
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
