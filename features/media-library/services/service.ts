import {
  getAssetById,
  listAssetsAdmin,
  listMediaCategories,
  listMediaCollections,
} from "@/services/media"
import type { MediaListParams } from "@/services/media/types"
import type { MediaLibraryOptions } from "../types/types"

export async function loadMediaLibrary(params: MediaListParams = {}) {
  return listAssetsAdmin(params)
}

export async function loadMediaOptions(): Promise<MediaLibraryOptions> {
  const [categories, collections] = await Promise.all([
    listMediaCategories(),
    listMediaCollections(),
  ])
  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  }
}

export async function loadMediaAsset(id: string) {
  const [asset, options] = await Promise.all([
    getAssetById(id),
    loadMediaOptions(),
  ])
  return { asset, options }
}

export async function loadMediaTaxonomy() {
  const [categories, collections] = await Promise.all([
    listMediaCategories(),
    listMediaCollections(),
  ])
  return { categories, collections }
}
