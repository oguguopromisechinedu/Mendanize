import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { ProjectsView } from "@/features/user-learning/components/projects-view";
import {
  listLearnerProjects,
  listPublishedProjectTemplates,
} from "@/services/ecosystem";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/projects")}`);
  }

  const [projects, templates] = await Promise.all([
    listLearnerProjects(session.user.id),
    listPublishedProjectTemplates(),
  ]);

  return <ProjectsView projects={projects} templates={templates} />;
}
