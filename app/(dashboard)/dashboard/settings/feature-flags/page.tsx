import type { Metadata } from "next"

import { loadFeatureFlags, FeatureFlagsView } from "@/features/platform-settings"

export const metadata: Metadata = {
  title: "Feature flags",
  robots: { index: false },
}

export default async function Page() {
  const flags = await loadFeatureFlags()
  return <FeatureFlagsView flags={flags} />
}
