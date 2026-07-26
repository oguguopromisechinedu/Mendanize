/**
 * Ecosystem service — Learner ↔ Admin catalog layer.
 * Covers: PromptPacks, ProjectTemplates, Certificates, FeaturedSetting,
 *         WorkspacePresets, community posts (Comments).
 */

import "server-only";

import { randomBytes } from "crypto";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { AuthorizationError, NotFoundError } from "@/lib/api/errors";
import type {
  CommunityPostRecord,
  CertificateRecord,
  CertificateTemplateRecord,
  CreateCertificateTemplateInput,
  CreateCommunityPostInput,
  CreateProjectTemplateInput,
  CreatePromptPackInput,
  CreatePromptPackItemInput,
  CreateWorkspacePresetInput,
  FeaturedSettingRecord,
  LearnerProjectRecord,
  ProjectTemplateRecord,
  PromptPackItemRecord,
  PromptPackRecord,
  UpdateCertificateTemplateInput,
  UpdateFeaturedSettingInput,
  UpdateLearnerProjectInput,
  UpdateProjectTemplateInput,
  UpdatePromptPackInput,
  UpdatePromptPackItemInput,
  UpdateWorkspacePresetInput,
  WorkspacePresetRecord,
} from "./types";

export type * from "./types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function db() {
  return getPrisma();
}

function assertDb(): void {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured. Set DATABASE_URL.");
  }
}

function assertOwner(userId: string, rowUserId: string): void {
  if (userId !== rowUserId) {
    throw new AuthorizationError("Access denied.");
  }
}

// ─── Prompt Packs (learner) ───────────────────────────────────────────────────

export async function listPublishedPromptPacks(): Promise<PromptPackRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().promptPack.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return rows as PromptPackRecord[];
}

// ─── Prompt Packs (admin) ─────────────────────────────────────────────────────

export async function adminListPromptPacks(): Promise<PromptPackRecord[]> {
  assertDb();
  const rows = await db().promptPack.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true } },
    },
  });
  return rows as PromptPackRecord[];
}

export async function adminGetPromptPack(id: string): Promise<PromptPackRecord> {
  assertDb();
  const row = await db().promptPack.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) throw new NotFoundError("Prompt pack not found.");
  return row as PromptPackRecord;
}

export async function adminCreatePromptPack(
  data: CreatePromptPackInput,
): Promise<PromptPackRecord> {
  assertDb();
  const row = await db().promptPack.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      category: data.category ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
    include: { items: true },
  });
  return row as PromptPackRecord;
}

export async function adminUpdatePromptPack(
  id: string,
  data: UpdatePromptPackInput,
): Promise<PromptPackRecord> {
  assertDb();
  const row = await db().promptPack.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return row as PromptPackRecord;
}

export async function adminPublishPromptPack(id: string): Promise<PromptPackRecord> {
  assertDb();
  const row = await db().promptPack.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return row as PromptPackRecord;
}

export async function adminArchivePromptPack(id: string): Promise<PromptPackRecord> {
  assertDb();
  const row = await db().promptPack.update({
    where: { id },
    data: { status: "ARCHIVED" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return row as PromptPackRecord;
}

export async function adminDeletePromptPack(id: string): Promise<void> {
  assertDb();
  await db().promptPack.delete({ where: { id } });
}

export async function adminCreatePromptPackItem(
  packId: string,
  data: CreatePromptPackItemInput,
): Promise<PromptPackItemRecord> {
  assertDb();
  const row = await db().promptPackItem.create({
    data: {
      packId,
      title: data.title,
      prompt: data.prompt,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return row as PromptPackItemRecord;
}

export async function adminUpdatePromptPackItem(
  id: string,
  data: UpdatePromptPackItemInput,
): Promise<PromptPackItemRecord> {
  assertDb();
  const row = await db().promptPackItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.prompt !== undefined && { prompt: data.prompt }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
  return row as PromptPackItemRecord;
}

export async function adminDeletePromptPackItem(id: string): Promise<void> {
  assertDb();
  await db().promptPackItem.delete({ where: { id } });
}

// ─── Project Templates (learner) ──────────────────────────────────────────────

export async function listPublishedProjectTemplates(): Promise<ProjectTemplateRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().projectTemplate.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  return rows as ProjectTemplateRecord[];
}

export async function listLearnerProjects(userId: string): Promise<LearnerProjectRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().learnerProject.findMany({
    where: { publicUserId: userId },
    orderBy: { startedAt: "desc" },
    include: { template: true },
  });
  return rows as LearnerProjectRecord[];
}

export async function startLearnerProject(
  userId: string,
  templateId: string,
): Promise<LearnerProjectRecord> {
  assertDb();
  const row = await db().learnerProject.upsert({
    where: { publicUserId_templateId: { publicUserId: userId, templateId } },
    create: { publicUserId: userId, templateId, status: "IN_PROGRESS" },
    update: {},
    include: { template: true },
  });
  return row as LearnerProjectRecord;
}

export async function updateLearnerProjectStatus(
  userId: string,
  projectId: string,
  data: UpdateLearnerProjectInput,
): Promise<LearnerProjectRecord> {
  assertDb();
  const existing = await db().learnerProject.findUnique({ where: { id: projectId } });
  if (!existing) throw new NotFoundError("Project not found.");
  assertOwner(userId, existing.publicUserId);

  const completedAt =
    data.status === "COMPLETED" ? (existing.completedAt ?? new Date()) : existing.completedAt;

  const row = await db().learnerProject.update({
    where: { id: projectId },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      completedAt,
    },
    include: { template: true },
  });
  return row as LearnerProjectRecord;
}

// ─── Project Templates (admin) ────────────────────────────────────────────────

export async function adminListProjectTemplates(): Promise<ProjectTemplateRecord[]> {
  assertDb();
  const rows = await db().projectTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows as ProjectTemplateRecord[];
}

export async function adminCreateProjectTemplate(
  data: CreateProjectTemplateInput,
): Promise<ProjectTemplateRecord> {
  assertDb();
  const row = await db().projectTemplate.create({
    data: {
      title: data.title,
      slug: data.slug,
      brief: data.brief,
      difficulty: data.difficulty ?? "BEGINNER",
      guideIds: data.guideIds ?? [],
      toolIds: data.toolIds ?? [],
      estimatedHours: data.estimatedHours ?? 4,
    },
  });
  return row as ProjectTemplateRecord;
}

export async function adminUpdateProjectTemplate(
  id: string,
  data: UpdateProjectTemplateInput,
): Promise<ProjectTemplateRecord> {
  assertDb();
  const row = await db().projectTemplate.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.brief !== undefined && { brief: data.brief }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
      ...(data.guideIds !== undefined && { guideIds: data.guideIds }),
      ...(data.toolIds !== undefined && { toolIds: data.toolIds }),
      ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
    },
  });
  return row as ProjectTemplateRecord;
}

export async function adminPublishProjectTemplate(
  id: string,
): Promise<ProjectTemplateRecord> {
  assertDb();
  const row = await db().projectTemplate.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  return row as ProjectTemplateRecord;
}

export async function adminDeleteProjectTemplate(id: string): Promise<void> {
  assertDb();
  await db().projectTemplate.delete({ where: { id } });
}

// ─── Certificate Templates (learner) ─────────────────────────────────────────

export async function listLearnerCertificates(userId: string): Promise<CertificateRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().certificate.findMany({
    where: { publicUserId: userId },
    orderBy: { issuedAt: "desc" },
    include: { template: true },
  });
  return rows as CertificateRecord[];
}

// ─── Certificate Templates (admin) ───────────────────────────────────────────

export async function adminListCertificateTemplates(): Promise<CertificateTemplateRecord[]> {
  assertDb();
  const rows = await db().certificateTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows as CertificateTemplateRecord[];
}

export async function adminCreateCertificateTemplate(
  data: CreateCertificateTemplateInput,
): Promise<CertificateTemplateRecord> {
  assertDb();
  const row = await db().certificateTemplate.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      guideId: data.guideId,
      badgeUrl: data.badgeUrl ?? null,
    },
  });
  return row as CertificateTemplateRecord;
}

export async function adminUpdateCertificateTemplate(
  id: string,
  data: UpdateCertificateTemplateInput,
): Promise<CertificateTemplateRecord> {
  assertDb();
  const row = await db().certificateTemplate.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.guideId !== undefined && { guideId: data.guideId }),
      ...(data.badgeUrl !== undefined && { badgeUrl: data.badgeUrl }),
    },
  });
  return row as CertificateTemplateRecord;
}

export async function adminPublishCertificateTemplate(
  id: string,
): Promise<CertificateTemplateRecord> {
  assertDb();
  const row = await db().certificateTemplate.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  return row as CertificateTemplateRecord;
}

export async function adminDeleteCertificateTemplate(id: string): Promise<void> {
  assertDb();
  await db().certificateTemplate.delete({ where: { id } });
}

// ─── Featured Learning ─────────────────────────────────────────────────────────

export async function getFeaturedSetting(): Promise<FeaturedSettingRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const row = await db().learningFeaturedSetting.findUnique({ where: { key: "main" } });
  return row as FeaturedSettingRecord | null;
}

export async function adminGetFeaturedSetting(): Promise<FeaturedSettingRecord | null> {
  assertDb();
  return getFeaturedSetting();
}

export async function adminUpdateFeaturedSetting(
  data: UpdateFeaturedSettingInput,
): Promise<FeaturedSettingRecord> {
  assertDb();
  const row = await db().learningFeaturedSetting.update({
    where: { key: "main" },
    data: {
      ...(data.featuredGuideIds !== undefined && {
        featuredGuideIds: data.featuredGuideIds,
      }),
      ...(data.featuredArticleIds !== undefined && {
        featuredArticleIds: data.featuredArticleIds,
      }),
      ...(data.featuredToolIds !== undefined && {
        featuredToolIds: data.featuredToolIds,
      }),
      ...(data.featuredPromptPackIds !== undefined && {
        featuredPromptPackIds: data.featuredPromptPackIds,
      }),
      ...(data.featuredProjectIds !== undefined && {
        featuredProjectIds: data.featuredProjectIds,
      }),
    },
  });
  return row as FeaturedSettingRecord;
}

// ─── Workspace Presets (learner) ──────────────────────────────────────────────

export async function listPublishedWorkspacePresets(): Promise<WorkspacePresetRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().workspacePreset.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  return rows as WorkspacePresetRecord[];
}

// ─── Workspace Presets (admin) ────────────────────────────────────────────────

export async function adminListWorkspacePresets(): Promise<WorkspacePresetRecord[]> {
  assertDb();
  const rows = await db().workspacePreset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows as WorkspacePresetRecord[];
}

export async function adminCreateWorkspacePreset(
  data: CreateWorkspacePresetInput,
): Promise<WorkspacePresetRecord> {
  assertDb();
  const row = await db().workspacePreset.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      guideId: data.guideId ?? null,
      starterPrompt: data.starterPrompt ?? null,
      challengeNote: data.challengeNote ?? null,
    },
  });
  return row as WorkspacePresetRecord;
}

export async function adminUpdateWorkspacePreset(
  id: string,
  data: UpdateWorkspacePresetInput,
): Promise<WorkspacePresetRecord> {
  assertDb();
  const row = await db().workspacePreset.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.guideId !== undefined && { guideId: data.guideId }),
      ...(data.starterPrompt !== undefined && { starterPrompt: data.starterPrompt }),
      ...(data.challengeNote !== undefined && { challengeNote: data.challengeNote }),
    },
  });
  return row as WorkspacePresetRecord;
}

export async function adminPublishWorkspacePreset(
  id: string,
): Promise<WorkspacePresetRecord> {
  assertDb();
  const row = await db().workspacePreset.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  return row as WorkspacePresetRecord;
}

export async function adminDeleteWorkspacePreset(id: string): Promise<void> {
  assertDb();
  await db().workspacePreset.delete({ where: { id } });
}

// ─── Community posts ──────────────────────────────────────────────────────────

export async function listCommunityFeed(limit = 50): Promise<CommunityPostRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().comment.findMany({
    where: {
      status: "APPROVED",
      entityType: { in: ["GUIDE", "PROJECT"] as const },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    publicUserId: r.publicUserId ?? null,
    entityType: String(r.entityType),
    entityId: r.entityId,
    body: r.body,
    status: String(r.status),
    createdAt: r.createdAt,
    authorName: r.authorName ?? null,
  }));
}

export async function createCommunityPost(
  input: CreateCommunityPostInput,
): Promise<CommunityPostRecord> {
  assertDb();
  // Look up the user's display name to populate authorName
  let authorName = "Mendanize learner";
  try {
    const user = await db().publicUser.findUnique({
      where: { id: input.publicUserId },
      select: { name: true },
    });
    if (user?.name) authorName = user.name;
  } catch {
    // non-fatal
  }

  const row = await db().comment.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      body: input.body,
      authorName,
      status: "PENDING",
      publicUserId: input.publicUserId,
    },
  });
  return {
    id: row.id,
    publicUserId: row.publicUserId ?? null,
    entityType: String(row.entityType),
    entityId: row.entityId,
    body: row.body,
    status: String(row.status),
    createdAt: row.createdAt,
    authorName: row.authorName ?? null,
  };
}

// ─── Daily activity ───────────────────────────────────────────────────────────

export async function markDailyActivity(userId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await db().learningDailyStat.upsert({
    where: { publicUserId_day: { publicUserId: userId, day: today } },
    create: { publicUserId: userId, day: today, activityCount: 1, minutesApprox: 1 },
    update: { activityCount: { increment: 1 } },
  });
}

// ─── Credential code generator ────────────────────────────────────────────────

export function generateCredentialCode(): string {
  return `MND-${randomBytes(6).toString("hex").toUpperCase()}`;
}
