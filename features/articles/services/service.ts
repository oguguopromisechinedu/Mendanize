import {
  createArticle,
  getArticleById,
  listArticlesAdmin,
  listCategorySummaries,
  listTagsAdmin,
  listTopicSummaries,
  updateArticle,
} from "@/services/content"
import type { ArticleAdminListParams } from "@/services/content/types"
import { listAssets } from "@/services/media"
import { suggestArticleSeo } from "@/services/seo"
import type { ArticleEditorOptions } from "../types/types"

export async function loadArticleList(params: ArticleAdminListParams) {
  return listArticlesAdmin(params)
}

export async function loadArticleEditor(id?: string) {
  const [categories, topics, tags, media, article] = await Promise.all([
    listCategorySummaries(),
    listTopicSummaries(),
    listTagsAdmin(),
    listAssets(),
    id ? getArticleById(id) : Promise.resolve(null),
  ])

  const options: ArticleEditorOptions = {
    categories,
    topics,
    tags,
    mediaPlaceholders: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
    })),
  }

  return { article, options }
}

export async function createArticleDraft(
  authorId: string,
  input: Omit<Parameters<typeof createArticle>[0], "authorId">
) {
  const seo =
    !input.seoTitle && !input.seoDescription
      ? suggestArticleSeo({ title: input.title, excerpt: input.excerpt })
      : null

  return createArticle({
    ...input,
    authorId,
    seoTitle: input.seoTitle ?? seo?.seoTitle ?? null,
    seoDescription: input.seoDescription ?? seo?.seoDescription ?? null,
  })
}

export async function saveArticle(
  id: string,
  input: Parameters<typeof updateArticle>[1]
) {
  return updateArticle(id, input)
}
