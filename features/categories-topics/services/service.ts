import {
  getCategoryById,
  getCategoryDetail,
  getTopicById,
  getTopicDetail,
  listCategoriesAdmin,
  listCategorySummaries,
  listTopicsAdmin,
} from "@/services/content"
import type {
  CategoryListParams,
  TopicListParams,
} from "@/services/content/types"
import { listAssets } from "@/services/media"

export async function loadCategoryList(params: CategoryListParams = {}) {
  return listCategoriesAdmin(params)
}

export async function loadTopicList(params: TopicListParams = {}) {
  return listTopicsAdmin(params)
}

export async function loadCategoryEditor(id?: string) {
  const [category, media] = await Promise.all([
    id ? getCategoryById(id) : Promise.resolve(null),
    listAssets(),
  ])
  return {
    category,
    mediaPlaceholders: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
    })),
  }
}

export async function loadTopicEditor(id?: string) {
  const [topic, categories, media] = await Promise.all([
    id ? getTopicById(id) : Promise.resolve(null),
    listCategorySummaries(),
    listAssets(),
  ])
  return {
    topic,
    categories,
    mediaPlaceholders: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
    })),
  }
}

export async function loadCategoryDetails(id: string) {
  return getCategoryDetail(id)
}

export async function loadTopicDetails(id: string) {
  return getTopicDetail(id)
}
