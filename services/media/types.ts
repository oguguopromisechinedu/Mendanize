/** Media Shared Service types (MES-002 / MES-014). */

export type AssetStatusValue = "ACTIVE" | "ARCHIVED" | "PROCESSING" | "FAILED";
export type MediaVisibilityValue = "PUBLIC" | "PRIVATE" | "UNLISTED";

export type MediaListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  mimePrefix?: string;
  status?: AssetStatusValue | "ALL";
  categoryId?: string;
  collectionId?: string;
  featured?: boolean;
  unusedOnly?: boolean;
  recentOnly?: boolean;
  sort?: "createdAt" | "filename" | "sizeBytes" | "lastUsedAt";
  sortDir?: "asc" | "desc";
};

export type UploadMediaParams = {
  filename: string;
  mimeType: string;
  /** Opaque until cloud storage (Supabase) is wired — accept URL or placeholder. */
  body?: unknown;
  altText?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  uploadedById?: string | null;
};

/** Compact shape used by editors / Media Picker / listAssets consumers. */
export type MediaAsset = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  width?: number;
  height?: number;
  createdAt: string;
  altText?: string | null;
  status?: AssetStatusValue;
};

export type MediaAssetRecord = {
  id: string;
  filename: string;
  originalName: string | null;
  mimeType: string;
  url: string;
  storageKey: string | null;
  storageProvider: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
  copyright: string | null;
  visibility: MediaVisibilityValue;
  featured: boolean;
  status: AssetStatusValue;
  categoryId: string | null;
  categoryName: string | null;
  collectionIds: string[];
  collectionNames: string[];
  tagNames: string[];
  usageCount: number;
  lastUsedAt: string | null;
  uploadedById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaListResult = {
  items: MediaAssetRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type MediaAssetWriteInput = {
  filename?: string;
  altText?: string | null;
  caption?: string | null;
  description?: string | null;
  copyright?: string | null;
  visibility?: MediaVisibilityValue;
  featured?: boolean;
  status?: AssetStatusValue;
  categoryId?: string | null;
  collectionIds?: string[];
  tagNames?: string[];
};

export type MediaCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  assetCount: number;
};

export type MediaCollectionRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  assetCount: number;
};

export type MediaCategoryWriteInput = {
  name: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
};

export type MediaCollectionWriteInput = {
  name: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
};
