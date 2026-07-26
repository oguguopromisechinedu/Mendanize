import type { Metadata } from "next";
import { adminGetFeaturedSetting } from "@/services/ecosystem";
import { FeaturedLearningView } from "@/features/ecosystem-admin";

export const metadata: Metadata = {
  title: "Featured Learning",
  robots: { index: false },
};

export default async function Page() {
  const setting = await adminGetFeaturedSetting().catch(() => null);
  return <FeaturedLearningView setting={setting} />;
}
