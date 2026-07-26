import type { Metadata } from "next";
import { adminListProjectTemplates } from "@/services/ecosystem";
import { ProjectTemplatesView } from "@/features/ecosystem-admin";

export const metadata: Metadata = {
  title: "Project Templates",
  robots: { index: false },
};

export default async function Page() {
  const templates = await adminListProjectTemplates().catch(() => []);
  return <ProjectTemplatesView templates={templates} />;
}
