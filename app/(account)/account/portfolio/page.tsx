import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  ExternalLink,
  FolderKanban,
  GitBranch,
  Globe,
} from "lucide-react";

import { requirePublicUser } from "@/features/authentication/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listShowcaseProjectsForUser } from "@/services/community";
import {
  getLatestCareerReadiness,
  getOrCreateCareerProfile,
  listCertificatesForUser,
} from "@/services/growth";

export const metadata: Metadata = {
  title: "Portfolio",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/portfolio")}`);
  }

  const userId = session.user.id;
  const [profile, certificates, projects, readiness] = await Promise.all([
    getOrCreateCareerProfile(userId),
    listCertificatesForUser(userId),
    listShowcaseProjectsForUser(userId),
    getLatestCareerReadiness(userId),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Portfolio
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your public-facing career story — profile, certificates, and
            community showcase projects in one place.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/account/career">Edit career profile</Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card/90 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {profile?.headline?.trim() || session.user.name || "Your name"}
            </h2>
            {profile?.targetRole ? (
              <p className="mt-1 text-sm text-primary">{profile.targetRole}</p>
            ) : null}
            {profile?.location ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {profile.location}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums text-primary">
              {readiness.score}
            </p>
            <p className="text-xs text-muted-foreground">Career readiness</p>
          </div>
        </div>
        {profile?.summary ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.summary}
          </p>
        ) : null}
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <FolderKanban className="size-5 text-primary" />
            Showcase projects
          </h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/community/projects">Browse community</Link>
          </Button>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No showcase projects yet. Publish from Community when you ship
            something you&apos;re proud of.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-border bg-card/80 p-4"
              >
                <Link
                  href={`/community/projects/${project.slug}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {project.title}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {project.descriptionPreview}
                </p>
                {project.technologies.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {project.likeCount} likes · {project.commentCount} comments
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <Award className="size-5 text-primary" />
          Certificates
        </h2>
        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete guide assessments to earn verifiable certificates.
          </p>
        ) : (
          <ul className="space-y-3">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{cert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString()} ·{" "}
                    {cert.credentialCode}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={cert.verifyPath}>
                    <Globe className="mr-1.5 size-3.5" />
                    Verify
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <GitBranch className="size-4" />
          Add demo and repo links when publishing showcase projects in Community.
        </p>
        <Button asChild size="sm" variant="link" className="mt-2 h-auto p-0">
          <Link href="/community/projects">
            Open project showcase
            <ExternalLink className="ml-1 size-3.5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
