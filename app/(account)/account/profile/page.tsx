import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  FolderKanban,
  User,
} from "lucide-react";

import { requirePublicUser } from "@/features/authentication/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLearnerProjects } from "@/services/ecosystem";
import {
  getLatestCareerReadiness,
  getOrCreateCareerProfile,
  listCertificatesForUser,
} from "@/services/growth";
import { getLearningStats } from "@/services/learning";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/profile")}`);
  }

  const userId = session.user.id;
  const [profile, stats, certificates, projects, readiness] = await Promise.all([
    getOrCreateCareerProfile(userId),
    getLearningStats(userId),
    listCertificatesForUser(userId),
    listLearnerProjects(userId),
    getLatestCareerReadiness(userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">
            {(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
              {session.user.name ?? "Learner"}
            </h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            {profile?.headline ? (
              <p className="mt-2 text-sm">{profile.headline}</p>
            ) : null}
            {profile?.targetRole ? (
              <Badge className="mt-2" variant="secondary">
                {profile.targetRole}
              </Badge>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/account/career">Edit career profile</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Streak" value={`${stats.streakDays} days`} />
        <StatCard icon={Award} label="Certificates" value={String(certificates.length)} />
        <StatCard icon={FolderKanban} label="Projects" value={String(projects.length)} />
        <StatCard
          icon={Briefcase}
          label="Career readiness"
          value={String(readiness.score)}
        />
      </div>

      {profile?.summary ? (
        <section className="rounded-2xl border border-border bg-card/90 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5" />
            About
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {profile.summary}
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/account/portfolio">Portfolio</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/certificates">Certificates</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/assessments">Assessments</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/preferences">Preferences</Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/90 p-4">
      <Icon className="mb-2 h-5 w-5 text-primary" />
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
