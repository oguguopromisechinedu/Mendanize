export const ASSET_STATUSES = [
  "ACTIVE",
  "ARCHIVED",
  "PROCESSING",
  "FAILED",
] as const

export const ASSET_STATUS_LABELS: Record<
  (typeof ASSET_STATUSES)[number],
  string
> = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  PROCESSING: "Processing",
  FAILED: "Failed",
}

export const MEDIA_VISIBILITIES = ["PUBLIC", "PRIVATE", "UNLISTED"] as const

export const MEDIA_VISIBILITY_LABELS: Record<
  (typeof MEDIA_VISIBILITIES)[number],
  string
> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  UNLISTED: "Unlisted",
}

export const ALLOWED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const

export const MEDIA_NAV = [
  { href: "/dashboard/media", label: "Library" },
  { href: "/dashboard/media/upload", label: "Upload" },
  { href: "/dashboard/media/recent", label: "Recently uploaded" },
  { href: "/dashboard/media/unused", label: "Unused" },
  { href: "/dashboard/media/collections", label: "Collections" },
  { href: "/dashboard/media/categories", label: "Categories" },
] as const

export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || bytes <= 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
