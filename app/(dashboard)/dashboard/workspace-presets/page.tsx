import type { Metadata } from "next";
import { adminListWorkspacePresets } from "@/services/ecosystem";
import { WorkspacePresetsView } from "@/features/ecosystem-admin";

export const metadata: Metadata = {
  title: "Workspace Presets",
  robots: { index: false },
};

export default async function Page() {
  const presets = await adminListWorkspacePresets().catch(() => []);
  return <WorkspacePresetsView presets={presets} />;
}
