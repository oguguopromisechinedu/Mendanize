import {
  getProviderStatuses,
  listGenerations,
} from "@/services/ai"
import {
  listCategorySummaries,
  listTopicSummaries,
} from "@/services/content"
import type { AIGenerationListParams } from "@/services/ai/types"

export async function loadStudioHome() {
  const [providers, recent] = await Promise.all([
    getProviderStatuses(),
    listGenerations({ pageSize: 8 }),
  ])
  return { providers, recent }
}

export async function loadStudioTaxonomy() {
  const [categories, topics] = await Promise.all([
    listCategorySummaries(),
    listTopicSummaries(),
  ])
  return { categories, topics }
}

export async function loadGenerationHistory(
  params: AIGenerationListParams = {}
) {
  return listGenerations(params)
}
