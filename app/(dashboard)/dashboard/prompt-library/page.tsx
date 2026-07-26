import type { Metadata } from "next";
import { adminListPromptPacks } from "@/services/ecosystem";
import { PromptLibraryView } from "@/features/ecosystem-admin";

export const metadata: Metadata = {
  title: "Prompt Library",
  robots: { index: false },
};

export default async function Page() {
  const packs = await adminListPromptPacks().catch(() => []);
  return <PromptLibraryView packs={packs} />;
}
