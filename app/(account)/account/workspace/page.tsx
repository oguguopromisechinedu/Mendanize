import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { WorkspaceView } from "@/features/user-learning/components/workspace-view";
import { listPublishedWorkspacePresets } from "@/services/ecosystem";

export const metadata: Metadata = {
  title: "Coding workspace",
  robots: { index: false },
};

export default async function Page() {
  await requirePublicUser();

  const presets = await listPublishedWorkspacePresets();

  return <WorkspaceView presets={presets} />;
}
