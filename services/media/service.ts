/**
 * Media Shared Service — MES-014 Digital Asset Management.
 * Cloud storage interface prepared; provider remains "placeholder" / URL-based.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type {
  AssetStatusValue,
  MediaAsset,
  MediaAssetRecord,
  MediaAssetWriteInput,
  MediaCategoryRecord,
  MediaCategoryWriteInput,
  MediaCollectionRecord,
  MediaCollectionWriteInput,
  MediaListParams,
  MediaListResult,
  UploadMediaParams,
} from "./types";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "application/pdf",
  "video/mp4",
  "audio/mpeg",
]);

function slugify(input: string, fallback = "item"): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || fallback
  );
}

const nowIso = () => new Date().toISOString();

const SEED_CATEGORIES: MediaCategoryRecord[] = [
  {
    id: "mcat_images",
    name: "Images",
    slug: "images",
    description: "General imagery",
    sortOrder: 0,
    assetCount: 0,
  },
  {
    id: "mcat_logos",
    name: "Logos",
    slug: "logos",
    description: "Brand marks",
    sortOrder: 1,
    assetCount: 0,
  },
  {
    id: "mcat_icons",
    name: "Icons",
    slug: "icons",
    description: "UI icons",
    sortOrder: 2,
    assetCount: 0,
  },
  {
    id: "mcat_documents",
    name: "Documents",
    slug: "documents",
    description: "Future document assets",
    sortOrder: 3,
    assetCount: 0,
  },
  {
    id: "mcat_av",
    name: "Video / Audio",
    slug: "video-audio",
    description: "Future A/V assets",
    sortOrder: 4,
    assetCount: 0,
  },
];

const SEED_COLLECTIONS: MediaCollectionRecord[] = [
  {
    id: "mcol_homepage",
    name: "Homepage",
    slug: "homepage",
    description: null,
    sortOrder: 0,
    assetCount: 0,
  },
  {
    id: "mcol_articles",
    name: "Articles",
    slug: "articles",
    description: null,
    sortOrder: 1,
    assetCount: 0,
  },
  {
    id: "mcol_guides",
    name: "Guides",
    slug: "guides",
    description: null,
    sortOrder: 2,
    assetCount: 0,
  },
  {
    id: "mcol_tools",
    name: "AI Tools",
    slug: "ai-tools",
    description: null,
    sortOrder: 3,
    assetCount: 0,
  },
  {
    id: "mcol_branding",
    name: "Branding",
    slug: "branding",
    description: null,
    sortOrder: 4,
    assetCount: 0,
  },
  {
    id: "mcol_marketing",
    name: "Marketing",
    slug: "marketing",
    description: null,
    sortOrder: 5,
    assetCount: 0,
  },
];

function seedAssets(): MediaAssetRecord[] {
  const t = nowIso();
  return [
    {
      id: "media_placeholder_1",
      filename: "amber-hero.webp",
      originalName: "amber-hero.webp",
      mimeType: "image/webp",
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
      storageKey: null,
      storageProvider: "placeholder",
      width: 1200,
      height: 800,
      sizeBytes: 245000,
      altText: "Amber abstract hero",
      caption: null,
      description: "Seed hero visual",
      copyright: null,
      visibility: "PUBLIC",
      featured: true,
      status: "ACTIVE",
      categoryId: "mcat_images",
      categoryName: "Images",
      collectionIds: ["mcol_homepage"],
      collectionNames: ["Homepage"],
      tagNames: ["hero"],
      usageCount: 1,
      lastUsedAt: t,
      uploadedById: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "media_placeholder_2",
      filename: "learning-grid.webp",
      originalName: "learning-grid.webp",
      mimeType: "image/webp",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
      storageKey: null,
      storageProvider: "placeholder",
      width: 1200,
      height: 800,
      sizeBytes: 198000,
      altText: "Learning grid illustration",
      caption: null,
      description: null,
      copyright: null,
      visibility: "PUBLIC",
      featured: false,
      status: "ACTIVE",
      categoryId: "mcat_images",
      categoryName: "Images",
      collectionIds: ["mcol_articles"],
      collectionNames: ["Articles"],
      tagNames: ["editorial"],
      usageCount: 0,
      lastUsedAt: null,
      uploadedById: null,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

const memory = {
  seeded: false,
  assets: [] as MediaAssetRecord[],
  categories: [] as MediaCategoryRecord[],
  collections: [] as MediaCollectionRecord[],
};

function ensureMemory() {
  if (memory.seeded) return;
  memory.seeded = true;
  memory.categories = SEED_CATEGORIES.map((c) => ({ ...c }));
  memory.collections = SEED_COLLECTIONS.map((c) => ({ ...c }));
  memory.assets = seedAssets();
  refreshCounts();
}

function refreshCounts() {
  for (const cat of memory.categories) {
    cat.assetCount = memory.assets.filter(
      (a) => a.categoryId === cat.id && a.status !== "ARCHIVED"
    ).length;
  }
  for (const col of memory.collections) {
    col.assetCount = memory.assets.filter((a) =>
      a.collectionIds.includes(col.id)
    ).length;
  }
}

function toCompact(a: MediaAssetRecord): MediaAsset {
  return {
    id: a.id,
    filename: a.filename,
    mimeType: a.mimeType,
    url: a.url,
    width: a.width ?? undefined,
    height: a.height ?? undefined,
    createdAt: a.createdAt,
    altText: a.altText,
    status: a.status,
  };
}

function assertMime(mimeType: string) {
  if (!ALLOWED_MIME.has(mimeType) && !mimeType.startsWith("image/")) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }
}

function extractUploadUrl(body: unknown, filename: string): string {
  if (
    typeof body === "object" &&
    body &&
    "url" in body &&
    typeof (body as { url?: unknown }).url === "string"
  ) {
    return (body as { url: string }).url.trim();
  }
  return `https://picsum.photos/seed/${encodeURIComponent(filename)}/1024`;
}

function extractUploadBytes(body: unknown): Buffer | null {
  if (!body || typeof body !== "object") return null;
  const record = body as {
    bytes?: unknown;
    base64?: unknown;
    data?: unknown;
  };
  if (typeof record.base64 === "string" && record.base64.trim()) {
    return Buffer.from(record.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
  }
  if (Buffer.isBuffer(record.bytes)) return record.bytes;
  if (record.bytes instanceof Uint8Array) return Buffer.from(record.bytes);
  if (typeof record.data === "string" && record.data.startsWith("data:")) {
    const raw = record.data.split(",")[1];
    if (raw) return Buffer.from(raw, "base64");
  }
  return null;
}

/**
 * Uploads bytes to Supabase Storage bucket `media` when service role env is set.
 * Create a public bucket named `media` in the Supabase dashboard first.
 */
async function uploadToSupabaseStorage(input: {
  filename: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<{ url: string; storageKey: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const storageKey = `uploads/${Date.now()}-${slugify(input.filename)}`;
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(storageKey, input.bytes, {
        contentType: input.mimeType,
        upsert: false,
      });
    if (error) {
      console.error("[media] supabase upload failed:", error.message);
      return null;
    }
    const { data } = supabaseAdmin.storage.from("media").getPublicUrl(storageKey);
    return { url: data.publicUrl, storageKey };
  } catch (error) {
    console.error(
      "[media] supabase upload error:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

function filterSortAssets(
  items: MediaAssetRecord[],
  params: MediaListParams
): MediaAssetRecord[] {
  let next = [...items];
  if (params.status && params.status !== "ALL") {
    next = next.filter((a) => a.status === params.status);
  } else if (!params.unusedOnly) {
    next = next.filter((a) => a.status !== "ARCHIVED");
  }
  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase();
    next = next.filter(
      (a) =>
        a.filename.toLowerCase().includes(q) ||
        (a.altText ?? "").toLowerCase().includes(q) ||
        a.tagNames.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (params.mimePrefix) {
    next = next.filter((a) => a.mimeType.startsWith(params.mimePrefix!));
  }
  if (params.categoryId) {
    next = next.filter((a) => a.categoryId === params.categoryId);
  }
  if (params.collectionId) {
    next = next.filter((a) => a.collectionIds.includes(params.collectionId!));
  }
  if (params.featured) {
    next = next.filter((a) => a.featured);
  }
  if (params.unusedOnly) {
    next = next.filter((a) => a.usageCount === 0 && a.status === "ACTIVE");
  }
  if (params.recentOnly) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    next = next.filter((a) => new Date(a.createdAt).getTime() >= weekAgo);
  }

  const sort = params.sort ?? "createdAt";
  const dir = params.sortDir === "asc" ? 1 : -1;
  next.sort((a, b) => {
    const av =
      sort === "filename"
        ? a.filename
        : sort === "sizeBytes"
          ? a.sizeBytes ?? 0
          : sort === "lastUsedAt"
            ? a.lastUsedAt ?? ""
            : a.createdAt;
    const bv =
      sort === "filename"
        ? b.filename
        : sort === "sizeBytes"
          ? b.sizeBytes ?? 0
          : sort === "lastUsedAt"
            ? b.lastUsedAt ?? ""
            : b.createdAt;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  return next;
}

type PrismaAssetRow = {
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
  visibility: MediaAssetRecord["visibility"];
  featured: boolean;
  status: AssetStatusValue;
  categoryId: string | null;
  lastUsedAt: Date | null;
  uploadedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string } | null;
  tags: Array<{ tag: { name: string } }>;
  collections: Array<{ collection: { id: string; name: string } }>;
  _count: { usages: number };
};

function mapPrismaAsset(row: PrismaAssetRow): MediaAssetRecord {
  return {
    id: row.id,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    url: row.url,
    storageKey: row.storageKey,
    storageProvider: row.storageProvider,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    altText: row.altText,
    caption: row.caption,
    description: row.description,
    copyright: row.copyright,
    visibility: row.visibility,
    featured: row.featured,
    status: row.status,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    collectionIds: row.collections.map((c) => c.collection.id),
    collectionNames: row.collections.map((c) => c.collection.name),
    tagNames: row.tags.map((t) => t.tag.name),
    usageCount: row._count.usages,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const assetInclude = {
  category: { select: { name: true } },
  tags: { include: { tag: { select: { name: true } } } },
  collections: {
    include: { collection: { select: { id: true, name: true } } },
  },
  _count: { select: { usages: true } },
} as const;

async function ensureTaxonomy() {
  const prisma = getPrisma();
  for (const cat of SEED_CATEGORIES) {
    await prisma.mediaCategory.upsert({
      where: { slug: cat.slug },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      update: {},
    });
  }
  for (const col of SEED_COLLECTIONS) {
    await prisma.mediaCollection.upsert({
      where: { slug: col.slug },
      create: {
        id: col.id,
        name: col.name,
        slug: col.slug,
        description: col.description,
        sortOrder: col.sortOrder,
      },
      update: {},
    });
  }
  const count = await prisma.mediaAsset.count();
  if (count === 0) {
    for (const a of seedAssets()) {
      await prisma.mediaAsset.create({
        data: {
          id: a.id,
          filename: a.filename,
          originalName: a.originalName,
          mimeType: a.mimeType,
          url: a.url,
          width: a.width,
          height: a.height,
          sizeBytes: a.sizeBytes,
          altText: a.altText,
          description: a.description,
          featured: a.featured,
          status: a.status,
          categoryId: a.categoryId,
          lastUsedAt: a.lastUsedAt ? new Date(a.lastUsedAt) : null,
          collections: {
            create: a.collectionIds.map((id, i) => ({
              collectionId: id,
              sortOrder: i,
            })),
          },
        },
      });
    }
  }
}

export async function listAssetsAdmin(
  params: MediaListParams = {}
): Promise<MediaListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 24));

  if (!isDatabaseConfigured()) {
    ensureMemory();
    const filtered = filterSortAssets(memory.assets, params);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  await ensureTaxonomy();
  const prisma = getPrisma();
  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  } else if (!params.unusedOnly) {
    where.status = { not: "ARCHIVED" };
  }
  if (params.query?.trim()) {
    const q = params.query.trim();
    where.OR = [
      { filename: { contains: q, mode: "insensitive" } },
      { altText: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.mimePrefix) {
    where.mimeType = { startsWith: params.mimePrefix };
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.collectionId) {
    where.collections = { some: { collectionId: params.collectionId } };
  }
  if (params.featured) where.featured = true;
  if (params.unusedOnly) {
    where.usages = { none: {} };
    where.status = "ACTIVE";
  }
  if (params.recentOnly) {
    where.createdAt = {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
  }

  const orderField = params.sort ?? "createdAt";
  const orderDir = params.sortDir ?? "desc";

  const [total, rows] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      include: assetInclude,
      orderBy: { [orderField]: orderDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapPrismaAsset(r as unknown as PrismaAssetRow)),
    total,
    page,
    pageSize,
  };
}

/** Compact list for editors & Media Picker (MES-002 / MES-014). */
export async function listAssets(
  params?: MediaListParams
): Promise<MediaAsset[]> {
  const result = await listAssetsAdmin({
    ...params,
    status: params?.status ?? "ACTIVE",
    pageSize: params?.pageSize ?? 50,
  });
  return result.items.map(toCompact);
}

export async function getAsset(id: string): Promise<MediaAsset | null> {
  const record = await getAssetById(id);
  return record ? toCompact(record) : null;
}

export async function getAssetById(
  id: string
): Promise<MediaAssetRecord | null> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.assets.find((a) => a.id === id) ?? null;
  }
  await ensureTaxonomy();
  const row = await getPrisma().mediaAsset.findUnique({
    where: { id },
    include: assetInclude,
  });
  return row ? mapPrismaAsset(row as unknown as PrismaAssetRow) : null;
}

export async function uploadAsset(
  params: UploadMediaParams
): Promise<MediaAsset> {
  assertMime(params.mimeType);
  const t = nowIso();
  const bytes = extractUploadBytes(params.body);
  const supabase = bytes
    ? await uploadToSupabaseStorage({
        filename: params.filename,
        mimeType: params.mimeType,
        bytes,
      })
    : null;

  const url =
    supabase?.url ?? extractUploadUrl(params.body, params.filename);
  const storageKey =
    supabase?.storageKey ??
    `placeholder/${Date.now()}-${slugify(params.filename)}`;
  const storageProvider = supabase ? "supabase" : bytes ? "local" : "url";

  if (!isDatabaseConfigured()) {
    ensureMemory();
    const record: MediaAssetRecord = {
      id: `media_${Date.now()}`,
      filename: params.filename,
      originalName: params.filename,
      mimeType: params.mimeType,
      url,
      storageKey,
      storageProvider,
      width: params.width ?? null,
      height: params.height ?? null,
      sizeBytes: params.sizeBytes ?? bytes?.byteLength ?? null,
      altText: params.altText ?? null,
      caption: null,
      description: null,
      copyright: null,
      visibility: "PUBLIC",
      featured: false,
      status: "ACTIVE",
      categoryId: params.categoryId ?? "mcat_images",
      categoryName:
        memory.categories.find((c) => c.id === (params.categoryId ?? "mcat_images"))
          ?.name ?? "Images",
      collectionIds: params.collectionId ? [params.collectionId] : [],
      collectionNames: params.collectionId
        ? memory.collections
            .filter((c) => c.id === params.collectionId)
            .map((c) => c.name)
        : [],
      tagNames: [],
      usageCount: 0,
      lastUsedAt: null,
      uploadedById: params.uploadedById ?? null,
      createdAt: t,
      updatedAt: t,
    };
    memory.assets.unshift(record);
    refreshCounts();
    return toCompact(record);
  }

  await ensureTaxonomy();
  const row = await getPrisma().mediaAsset.create({
    data: {
      filename: params.filename,
      originalName: params.filename,
      mimeType: params.mimeType,
      url,
      storageKey,
      storageProvider,
      width: params.width ?? null,
      height: params.height ?? null,
      sizeBytes: params.sizeBytes ?? bytes?.byteLength ?? null,
      altText: params.altText ?? null,
      categoryId: params.categoryId ?? null,
      uploadedById: params.uploadedById ?? null,
      collections: params.collectionId
        ? { create: [{ collectionId: params.collectionId, sortOrder: 0 }] }
        : undefined,
    },
    include: assetInclude,
  });
  return toCompact(mapPrismaAsset(row as unknown as PrismaAssetRow));
}

export async function updateAsset(
  id: string,
  input: MediaAssetWriteInput
): Promise<MediaAssetRecord | null> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const idx = memory.assets.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const prev = memory.assets[idx];
    const collectionIds = input.collectionIds ?? prev.collectionIds;
    memory.assets[idx] = {
      ...prev,
      filename: input.filename ?? prev.filename,
      altText: input.altText !== undefined ? input.altText : prev.altText,
      caption: input.caption !== undefined ? input.caption : prev.caption,
      description:
        input.description !== undefined ? input.description : prev.description,
      copyright:
        input.copyright !== undefined ? input.copyright : prev.copyright,
      visibility: input.visibility ?? prev.visibility,
      featured: input.featured ?? prev.featured,
      status: input.status ?? prev.status,
      categoryId:
        input.categoryId !== undefined ? input.categoryId : prev.categoryId,
      categoryName:
        input.categoryId !== undefined
          ? memory.categories.find((c) => c.id === input.categoryId)?.name ??
            null
          : prev.categoryName,
      collectionIds,
      collectionNames: memory.collections
        .filter((c) => collectionIds.includes(c.id))
        .map((c) => c.name),
      tagNames: input.tagNames ?? prev.tagNames,
      updatedAt: nowIso(),
    };
    refreshCounts();
    return memory.assets[idx];
  }

  const prisma = getPrisma();
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id },
      data: {
        filename: input.filename,
        altText: input.altText,
        caption: input.caption,
        description: input.description,
        copyright: input.copyright,
        visibility: input.visibility,
        featured: input.featured,
        status: input.status,
        categoryId: input.categoryId,
      },
    });

    if (input.collectionIds) {
      await tx.mediaCollectionAsset.deleteMany({ where: { assetId: id } });
      if (input.collectionIds.length) {
        await tx.mediaCollectionAsset.createMany({
          data: input.collectionIds.map((collectionId, i) => ({
            assetId: id,
            collectionId,
            sortOrder: i,
          })),
        });
      }
    }

    if (input.tagNames) {
      await tx.mediaAssetTag.deleteMany({ where: { assetId: id } });
      for (const name of input.tagNames) {
        const slug = slugify(name);
        const tag = await tx.mediaTag.upsert({
          where: { slug },
          create: { name, slug },
          update: { name },
        });
        await tx.mediaAssetTag.create({
          data: { assetId: id, tagId: tag.id },
        });
      }
    }
  });

  return getAssetById(id);
}

export async function deleteAssets(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const before = memory.assets.length;
    memory.assets = memory.assets.filter((a) => !ids.includes(a.id));
    refreshCounts();
    return before - memory.assets.length;
  }
  const result = await getPrisma().mediaAsset.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function bulkUpdateAssetStatus(
  ids: string[],
  status: AssetStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    ensureMemory();
    let n = 0;
    for (const a of memory.assets) {
      if (ids.includes(a.id)) {
        a.status = status;
        a.updatedAt = nowIso();
        n += 1;
      }
    }
    refreshCounts();
    return n;
  }
  const result = await getPrisma().mediaAsset.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
  return result.count;
}

export async function acceptGeneratedImage(input: {
  url: string;
  filename?: string;
}): Promise<MediaAsset> {
  return uploadAsset({
    filename: input.filename || `ai-studio-${Date.now()}.webp`,
    mimeType: "image/webp",
    body: { url: input.url },
    categoryId: isDatabaseConfigured() ? undefined : "mcat_images",
  });
}

export async function resolveMediaPickerUrl(url: string): Promise<string> {
  return url.trim();
}

export async function recordMediaUsage(input: {
  assetId: string;
  entityType: string;
  entityId: string;
  field?: string;
}): Promise<void> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const asset = memory.assets.find((a) => a.id === input.assetId);
    if (asset) {
      asset.usageCount += 1;
      asset.lastUsedAt = nowIso();
    }
    return;
  }
  const prisma = getPrisma();
  await prisma.mediaUsage.create({
    data: {
      assetId: input.assetId,
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
    },
  });
  await prisma.mediaAsset.update({
    where: { id: input.assetId },
    data: { lastUsedAt: new Date() },
  });
}

export async function listMediaCategories(): Promise<MediaCategoryRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.categories.map((c) => ({ ...c }));
  }
  await ensureTaxonomy();
  const rows = await getPrisma().mediaCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { assets: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    sortOrder: r.sortOrder,
    assetCount: r._count.assets,
  }));
}

export async function listMediaCollections(): Promise<MediaCollectionRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.collections.map((c) => ({ ...c }));
  }
  await ensureTaxonomy();
  const rows = await getPrisma().mediaCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { assets: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    sortOrder: r.sortOrder,
    assetCount: r._count.assets,
  }));
}

export async function createMediaCategory(
  input: MediaCategoryWriteInput
): Promise<MediaCategoryRecord> {
  const slug = slugify(input.slug || input.name);
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const cat: MediaCategoryRecord = {
      id: `mcat_${Date.now()}`,
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? memory.categories.length,
      assetCount: 0,
    };
    memory.categories.push(cat);
    return cat;
  }
  const row = await getPrisma().mediaCategory.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    assetCount: 0,
  };
}

export async function updateMediaCategory(
  id: string,
  input: MediaCategoryWriteInput
): Promise<MediaCategoryRecord | null> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const cat = memory.categories.find((c) => c.id === id);
    if (!cat) return null;
    cat.name = input.name;
    cat.slug = slugify(input.slug || input.name);
    cat.description = input.description ?? null;
    if (input.sortOrder != null) cat.sortOrder = input.sortOrder;
    return { ...cat };
  }
  const row = await getPrisma().mediaCategory.update({
    where: { id },
    data: {
      name: input.name,
      slug: slugify(input.slug || input.name),
      description: input.description ?? null,
      sortOrder: input.sortOrder,
    },
    include: { _count: { select: { assets: true } } },
  });
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    assetCount: row._count.assets,
  };
}

export async function deleteMediaCategory(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const before = memory.categories.length;
    memory.categories = memory.categories.filter((c) => c.id !== id);
    for (const a of memory.assets) {
      if (a.categoryId === id) {
        a.categoryId = null;
        a.categoryName = null;
      }
    }
    return memory.categories.length < before;
  }
  await getPrisma().mediaCategory.delete({ where: { id } });
  return true;
}

export async function createMediaCollection(
  input: MediaCollectionWriteInput
): Promise<MediaCollectionRecord> {
  const slug = slugify(input.slug || input.name);
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const col: MediaCollectionRecord = {
      id: `mcol_${Date.now()}`,
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? memory.collections.length,
      assetCount: 0,
    };
    memory.collections.push(col);
    return col;
  }
  const row = await getPrisma().mediaCollection.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    assetCount: 0,
  };
}

export async function updateMediaCollection(
  id: string,
  input: MediaCollectionWriteInput
): Promise<MediaCollectionRecord | null> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const col = memory.collections.find((c) => c.id === id);
    if (!col) return null;
    col.name = input.name;
    col.slug = slugify(input.slug || input.name);
    col.description = input.description ?? null;
    if (input.sortOrder != null) col.sortOrder = input.sortOrder;
    return { ...col };
  }
  const row = await getPrisma().mediaCollection.update({
    where: { id },
    data: {
      name: input.name,
      slug: slugify(input.slug || input.name),
      description: input.description ?? null,
      sortOrder: input.sortOrder,
    },
    include: { _count: { select: { assets: true } } },
  });
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    assetCount: row._count.assets,
  };
}

export async function deleteMediaCollection(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const before = memory.collections.length;
    memory.collections = memory.collections.filter((c) => c.id !== id);
    for (const a of memory.assets) {
      a.collectionIds = a.collectionIds.filter((x) => x !== id);
      a.collectionNames = memory.collections
        .filter((c) => a.collectionIds.includes(c.id))
        .map((c) => c.name);
    }
    refreshCounts();
    return memory.collections.length < before;
  }
  await getPrisma().mediaCollection.delete({ where: { id } });
  return true;
}

export async function moveAssetsToCollection(
  assetIds: string[],
  collectionId: string
): Promise<number> {
  if (!assetIds.length) return 0;
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const col = memory.collections.find((c) => c.id === collectionId);
    if (!col) return 0;
    let n = 0;
    for (const a of memory.assets) {
      if (assetIds.includes(a.id) && !a.collectionIds.includes(collectionId)) {
        a.collectionIds.push(collectionId);
        a.collectionNames.push(col.name);
        n += 1;
      }
    }
    refreshCounts();
    return n;
  }
  let n = 0;
  for (const assetId of assetIds) {
    await getPrisma().mediaCollectionAsset.upsert({
      where: {
        collectionId_assetId: { collectionId, assetId },
      },
      create: { collectionId, assetId },
      update: {},
    });
    n += 1;
  }
  return n;
}
