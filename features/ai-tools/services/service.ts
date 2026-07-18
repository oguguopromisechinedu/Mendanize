import {
  getToolById,
  listCategorySummaries,
  listToolsAdmin,
  listTopicSummaries,
} from "@/services/content"
import type { ToolListParams } from "@/services/content/types"
import { listAssets } from "@/services/media"
import type { ToolEditorOptions } from "../types/types"

export async function loadToolList(params: ToolListParams = {}) {
  return listToolsAdmin(params)
}

export async function loadToolEditor(id?: string) {
  const [categories, topics, media, tool] = await Promise.all([
    listCategorySummaries(),
    listTopicSummaries(),
    listAssets(),
    id ? getToolById(id) : Promise.resolve(null),
  ])

  const options: ToolEditorOptions = {
    categories,
    topics,
    mediaPlaceholders: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
    })),
  }

  return { tool, options }
}
