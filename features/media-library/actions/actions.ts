"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import {
  bulkUpdateAssetStatus,
  createMediaCategory,
  createMediaCollection,
  deleteAssets,
  deleteMediaCategory,
  deleteMediaCollection,
  moveAssetsToCollection,
  updateAsset,
  updateMediaCategory,
  updateMediaCollection,
  uploadAsset,
} from "@/services/media"
import type { MediaAsset, MediaAssetRecord } from "@/services/media/types"
import {
  assetWriteSchema,
  bulkIdsSchema,
  bulkStatusSchema,
  categoryWriteSchema,
  collectionWriteSchema,
  moveCollectionSchema,
  uploadSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateMedia() {
  revalidatePath("/dashboard/media")
  revalidatePath("/dashboard/media/upload")
  revalidatePath("/dashboard/media/recent")
  revalidatePath("/dashboard/media/unused")
  revalidatePath("/dashboard/media/collections")
  revalidatePath("/dashboard/media/categories")
}

export async function uploadMediaAction(
  input: unknown
): Promise<ActionResult<MediaAsset>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = uploadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid upload" }

  try {
    const data = parsed.data
    const asset = await uploadAsset({
      filename: data.filename,
      mimeType: data.mimeType,
      body: data.url ? { url: data.url } : undefined,
      altText: data.altText,
      categoryId: data.categoryId,
      collectionId: data.collectionId,
      width: data.width,
      height: data.height,
      sizeBytes: data.sizeBytes,
      uploadedById: session.user.id,
    })
    revalidateMedia()
    return { ok: true, message: "Asset uploaded", data: asset }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

export async function updateAssetAction(
  id: string,
  input: unknown
): Promise<ActionResult<MediaAssetRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = assetWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }

  try {
    const asset = await updateAsset(id, parsed.data)
    if (!asset) return { ok: false, message: "Asset not found" }
    revalidateMedia()
    revalidatePath(`/dashboard/media/${id}`)
    return { ok: true, message: "Asset updated", data: asset }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Update failed",
    }
  }
}

export async function deleteAssetsAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkIdsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select at least one asset" }
  const count = await deleteAssets(parsed.data.ids)
  revalidateMedia()
  return { ok: true, message: `Deleted ${count} asset(s)`, data: { count } }
}

export async function bulkAssetStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  const count = await bulkUpdateAssetStatus(
    parsed.data.ids,
    parsed.data.status
  )
  revalidateMedia()
  return {
    ok: true,
    message: `Updated ${count} asset(s)`,
    data: { count },
  }
}

export async function moveToCollectionAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = moveCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  const count = await moveAssetsToCollection(
    parsed.data.ids,
    parsed.data.collectionId
  )
  revalidateMedia()
  return { ok: true, message: `Moved ${count} asset(s)`, data: { count } }
}

export async function saveCategoryAction(
  input: unknown,
  id?: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = categoryWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  if (id) {
    const row = await updateMediaCategory(id, {
      ...parsed.data,
      slug: parsed.data.slug || undefined,
    })
    if (!row) return { ok: false, message: "Not found" }
  } else {
    await createMediaCategory({
      ...parsed.data,
      slug: parsed.data.slug || undefined,
    })
  }
  revalidateMedia()
  return { ok: true, message: "Category saved" }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  await deleteMediaCategory(id)
  revalidateMedia()
  return { ok: true, message: "Category deleted" }
}

export async function saveCollectionAction(
  input: unknown,
  id?: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = collectionWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  if (id) {
    const row = await updateMediaCollection(id, {
      ...parsed.data,
      slug: parsed.data.slug || undefined,
    })
    if (!row) return { ok: false, message: "Not found" }
  } else {
    await createMediaCollection({
      ...parsed.data,
      slug: parsed.data.slug || undefined,
    })
  }
  revalidateMedia()
  return { ok: true, message: "Collection saved" }
}

export async function deleteCollectionAction(
  id: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  await deleteMediaCollection(id)
  revalidateMedia()
  return { ok: true, message: "Collection deleted" }
}
