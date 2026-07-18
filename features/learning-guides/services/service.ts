import {
  getGuideById,
  listCategorySummaries,
  listGuidesAdmin,
  listTopicSummaries,
} from "@/services/content"
import type { GuideListParams } from "@/services/content/types"
import { listAssets } from "@/services/media"
import type { GuideEditorOptions } from "../types/types"

export async function loadGuideList(params: GuideListParams = {}) {
  return listGuidesAdmin(params)
}

export async function loadGuideEditor(id?: string) {
  const [categories, topics, media, guide] = await Promise.all([
    listCategorySummaries(),
    listTopicSummaries(),
    listAssets(),
    id ? getGuideById(id) : Promise.resolve(null),
  ])

  const options: GuideEditorOptions = {
    categories,
    topics,
    mediaPlaceholders: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
    })),
  }

  return { guide, options }
}
