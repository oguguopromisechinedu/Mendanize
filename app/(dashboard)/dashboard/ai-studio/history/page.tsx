import { loadGenerationHistory } from "@/features/ai-studio/server";
import type { Metadata } from "next"

import { GenerationHistoryView } from "@/features/ai-studio";
import type { AIGenerationTypeValue } from "@/services/ai/types"

export const metadata: Metadata = {
  title: "Generation history",
  robots: { index: false },
}

export default async function GenerationHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const type =
    typeof raw.type === "string"
      ? (raw.type as AIGenerationTypeValue | "ALL")
      : "ALL"
  const initial = await loadGenerationHistory({
    query: typeof raw.query === "string" ? raw.query : undefined,
    type,
    pageSize: 50,
  })
  return <GenerationHistoryView initial={initial} />
}
