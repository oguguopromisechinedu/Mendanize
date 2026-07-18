import type { Metadata } from "next"

import { GenerateImageView } from "@/features/ai-studio"

export const metadata: Metadata = {
  title: "Generate image",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GenerateImagePage({ searchParams }: PageProps) {
  const raw = await searchParams
  const prompt = typeof raw.prompt === "string" ? raw.prompt : null
  return <GenerateImageView initialPrompt={prompt} />
}
