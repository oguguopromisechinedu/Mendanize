import type { Metadata } from "next"

import { GenerateVideoView } from "@/features/ai-studio"

export const metadata: Metadata = {
  title: "Generate video",
  robots: { index: false },
}

export default function GenerateVideoPage() {
  return <GenerateVideoView />
}
