import { loadStudioHome } from "@/features/ai-studio/server";
import type { Metadata } from "next"

import { StudioHomeView } from "@/features/ai-studio"

export const metadata: Metadata = {
  title: "AI Studio",
  robots: { index: false },
}

export default async function AiStudioPage() {
  const { providers, recent } = await loadStudioHome()
  return <StudioHomeView providers={providers} recent={recent} />
}
