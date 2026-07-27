import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Cloud,
  FolderKanban,
  MessageSquareText,
  NotebookPen,
} from "lucide-react";

import { requirePublicUser } from "@/features/authentication/server";
import { listLearnerProjects } from "@/services/ecosystem";
import {
  listCertificatesForUser,
  listLearnerNotes,
  listPromptLibrary,
} from "@/services/growth";

export const metadata: Metadata = {
  title: "Mendanize Cloud",
  robots: { index: false },
};

const FOLDERS = [
  {
    key: "projects",
    label: "Projects",
    description: "In-progress and completed learner projects",
    href: "/account/projects",
    icon: FolderKanban,
  },
  {
    key: "notes",
    label: "Notes",
    description: "Private study notes from your learning journey",
    href: "/account/notes",
    icon: NotebookPen,
  },
  {
    key: "prompts",
    label: "Prompt library",
    description: "Saved prompts for AI Tutor and workflows",
    href: "/account/prompts",
    icon: MessageSquareText,
  },
  {
    key: "certificates",
    label: "Certificates",
    description: "Credentials earned from completed guides",
    href: "/account/certificates",
    icon: Award,
  },
] as const;

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/cloud")}`);
  }

  const userId = session.user.id;
  const [projects, notes, prompts, certificates] = await Promise.all([
    listLearnerProjects(userId),
    listLearnerNotes(userId),
    listPromptLibrary(userId),
    listCertificatesForUser(userId),
  ]);

  const counts: Record<(typeof FOLDERS)[number]["key"], number> = {
    projects: projects.length,
    notes: notes.length,
    prompts: prompts.length,
    certificates: certificates.length,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          <Cloud className="size-8 text-primary" />
          Mendanize Cloud
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your personal cloud workspace — projects, notes, prompts, and
          certificates synced to your learner account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FOLDERS.map((folder) => {
          const Icon = folder.icon;
          return (
            <Link
              key={folder.key}
              href={folder.href}
              className="group rounded-2xl border border-border bg-card/90 p-5 transition hover:border-primary/40 hover:bg-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                  {counts[folder.key]}
                </span>
              </div>
              <h2 className="mt-4 font-medium text-foreground group-hover:text-primary">
                {folder.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {folder.description}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        Portfolio assets and public showcase projects live in{" "}
        <Link href="/account/portfolio" className="text-primary underline-offset-4 hover:underline">
          Portfolio
        </Link>
        .
      </p>
    </div>
  );
}
