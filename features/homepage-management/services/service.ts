import {
  listArticlesAdmin,
  listCategorySummaries,
  listGuidesAdmin,
  listToolsAdmin,
} from "@/services/content"
import { getHomepageAdmin } from "@/services/content/homepage"
import type { FeaturedPickerOptions } from "../types/types"

export async function loadHomepageAdmin() {
  return getHomepageAdmin()
}

export async function loadFeaturedPickerOptions(): Promise<FeaturedPickerOptions> {
  const [categories, articles, guides, tools] = await Promise.all([
    listCategorySummaries(),
    listArticlesAdmin({ status: "PUBLISHED", pageSize: 50 }),
    listGuidesAdmin({ status: "PUBLISHED", pageSize: 50 }),
    listToolsAdmin({ status: "PUBLISHED", pageSize: 50 }),
  ])

  return {
    categories,
    articles: articles.items.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
    })),
    guides: guides.items.map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
    })),
    tools: tools.items.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    })),
  }
}
